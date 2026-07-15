
import {
  IsString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role } from '../guards/role/role.enum';

export class RegisterDto {
  @IsNotEmpty() @IsString() username!: string;
  @IsEmail() email!: string;
  @MinLength(8, { message: "Password is at least 8 characters"}) password!: string;
  @IsEnum(Role) role!: Role;
}
