import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { RealNameDto } from './dto/real-name.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RealNameInfo, User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

@Injectable()
export class UsersService {
  // 构造函数注入：@InjectRepository(User) 由 TypeOrmModule.forFeature 提供
  // JwtService、ConfigService 则来自模块导入的 Provider，Nest 容器会自动组装
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterUserDto): Promise<Omit<User, 'passwordHash'>> {
    const existing = await this.userRepository
      .createQueryBuilder('user')
      .where('user.phone = :phone', { phone: dto.phone })
      .getOne();

    if (existing) {
      throw new ConflictException('手机号已被注册');
    }

    const user = this.userRepository.create({
      phone: dto.phone,
      passwordHash: await this.hashPassword(dto.password),
      nickname: dto.nickname ?? null,
      tags: [],
      realNameInfo: null,
    });

    try {
      const saved = await this.userRepository.save(user);
      return this.toPublicUser(saved);
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('手机号已被注册');
      }
      throw error;
    }
  }

  async login(dto: LoginUserDto): Promise<{
    accessToken: string;
    tokenType: string;
    expiresIn: string;
    user: Omit<User, 'passwordHash'>;
  }> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.phone = :phone', { phone: dto.phone })
      .getOne();

    if (!user || !(await this.verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    if (!user.isActive) {
      throw new ForbiddenException('账号已被禁用');
    }

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const payload: JwtPayload = { sub: user.id, phone: user.phone, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '7d'),
      user: this.toPublicUser(user),
    };
  }

  async findMe(userId: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findOneOrFail(userId);
    return this.toPublicUser(user);
  }

  async findAll(query: QueryUsersDto): Promise<{
    items: Omit<User, 'passwordHash'>[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.userRepository.createQueryBuilder('user');
    if (query.phone) {
      qb.andWhere('user.phone LIKE :phone', { phone: `%${query.phone}%` });
    }
    if (query.nickname) {
      qb.andWhere('user.nickname LIKE :nickname', { nickname: `%${query.nickname}%` });
    }
    if (query.gender) {
      qb.andWhere('user.gender = :gender', { gender: query.gender });
    }
    if (query.vipLevel !== undefined) {
      qb.andWhere('user.vipLevel = :vipLevel', { vipLevel: query.vipLevel });
    }

    const [users, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items: users.map((user) => this.toPublicUser(user)), total, page, limit };
  }

  async findOne(id: number): Promise<Omit<User, 'passwordHash'>> {
    return this.toPublicUser(await this.findOneOrFail(id));
  }

  async update(id: number, dto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.findOneOrFail(id);
    const changes: Partial<User> = {};

    if (dto.nickname !== undefined) changes.nickname = dto.nickname;
    if (dto.gender !== undefined) changes.gender = dto.gender;
    if (dto.age !== undefined) changes.age = dto.age;
    if (dto.occupation !== undefined) changes.occupation = dto.occupation;
    if (dto.avatar !== undefined) changes.avatar = dto.avatar;
    if (dto.email !== undefined) changes.email = dto.email;
    if (dto.tags !== undefined) changes.tags = dto.tags;

    if (Object.keys(changes).length > 0) {
      try {
        await this.userRepository.update(user.id, changes);
      } catch (error: any) {
        if (error?.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('邮箱已被使用');
        }
        throw error;
      }
    }

    return this.findOne(id);
  }

  async changePassword(id: number, dto: ChangePasswordDto): Promise<{ changed: boolean }> {
    const user = await this.findOneWithPassword(id);
    if (!(await this.verifyPassword(dto.oldPassword, user.passwordHash))) {
      throw new UnauthorizedException('原密码不正确');
    }

    await this.userRepository.update(id, {
      passwordHash: await this.hashPassword(dto.newPassword),
    });
    return { changed: true };
  }

  async submitRealName(id: number, dto: RealNameDto): Promise<Omit<User, 'passwordHash'>> {
    await this.findOneOrFail(id);
    const info: RealNameInfo = {
      realName: dto.realName,
      idNumber: dto.idNumber,
      verified: false,
      submittedAt: new Date().toISOString(),
    };
    await this.userRepository.update(id, { realNameInfo: info });
    return this.findOne(id);
  }

  private async findOneOrFail(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    return user;
  }

  private async findOneWithPassword(id: number): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new NotFoundException(`用户 ${id} 不存在`);
    }
    return user;
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = await scryptAsync(password, salt, 64);
    return `${salt}:${derived.toString('hex')}`;
  }

  private async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [salt, key] = stored.split(':');
    if (!salt || !key) {
      return false;
    }
    const derived = await scryptAsync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    return keyBuffer.length === derived.length && timingSafeEqual(keyBuffer, derived);
  }

  private toPublicUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...rest } = user;
    return {
      ...rest,
      tags: user.tags ?? [],
      realNameInfo: user.realNameInfo
        ? { ...user.realNameInfo, idNumber: this.maskIdNumber(user.realNameInfo.idNumber) }
        : null,
    };
  }

  private maskIdNumber(idNumber: string): string {
    if (idNumber.length <= 8) {
      return '****';
    }
    return `${idNumber.slice(0, 4)}${'*'.repeat(idNumber.length - 8)}${idNumber.slice(-4)}`;
  }
}
