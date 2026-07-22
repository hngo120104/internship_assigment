import { IsEmail, MinLength, ValidateIf } from 'class-validator';

export class LoginRequestDto {
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
}
