import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { RealNameDto } from './dto/real-name.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 用户列表属于管理功能，叠加 AdminGuard（类级 JwtAuthGuard 先执行，再把 role 交给这里判断）
  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get('me')
  findMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findMe(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.sub, dto);
  }

  @Patch('me/password')
  changePassword(@CurrentUser() user: JwtPayload, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.sub, dto);
  }

  @Patch('me/real-name')
  submitRealName(@CurrentUser() user: JwtPayload, @Body() dto: RealNameDto) {
    return this.usersService.submitRealName(user.sub, dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() current: JwtPayload,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    if (current.sub !== id && current.role !== 'admin') {
      throw new ForbiddenException('只能修改自己的用户信息');
    }
    return this.usersService.update(id, dto);
  }
}
