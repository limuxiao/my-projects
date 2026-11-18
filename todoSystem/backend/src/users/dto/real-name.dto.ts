import { IsString, Length } from 'class-validator';

export class RealNameDto {
  @IsString()
  @Length(2, 50)
  realName: string;

  @IsString()
  @Length(15, 18)
  idNumber: string;
}
