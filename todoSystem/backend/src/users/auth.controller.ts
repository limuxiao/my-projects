import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from './users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // @Body() 让 Nest 把请求体绑定并转换成 DTO 参数
  // @HttpCode(HttpStatus.OK) 把 POST 默认的 201 改为 200
  login(@Body() dto: LoginUserDto) {
    return this.usersService.login(dto);
  }
}
