import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @Matches(/^\+?\d{6,20}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  @MinLength(8, { message: '密码至少 8 位' })
  @MaxLength(64)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;
}
