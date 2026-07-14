// dto/register.dto.ts
import { IsString, IsEmail, IsEnum, IsNotEmpty, MinLength, ValidateIf } from 'class-validator';

export enum UserRole {
  SHOP = 'SHOP',
  CUSTOMER = 'CUSTOMER',
}

export class RegisterDto {
  @IsNotEmpty() @IsString() username!: string;
  @IsEmail() email!: string;
  @MinLength(6) password!: string;
  @IsEnum(UserRole) role!: UserRole;
}