import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// JWT 配置与 JwtAuthGuard 已由全局 AuthModule 提供，这里不再重复注册
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController, UsersController],
  providers: [UsersService],
})
export class UsersModule {}
