import { IsString, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsString()
  phone: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string;
}
