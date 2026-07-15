import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsEmail,
  IsNumber,
  IsDate,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { Role } from '../../auth/guards/role/role.enum';

export class UserResponseDto {
  @IsNotEmpty() @IsNumber() @Expose() id!: number;
  @IsString() @IsNotEmpty() @Expose() username!: string;
  @IsString() full_name?: string;
  @IsEmail() @IsNotEmpty() @Expose() email!: string;
  @IsEnum(Role) @IsNotEmpty() @Expose() role!: Role;
  @IsNotEmpty() @IsDate() createdAt?: Date;
}
