import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SearchStudyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  q: string;
}
