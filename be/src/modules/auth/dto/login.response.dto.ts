import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { Role } from '../../auth/guards/role/role.enum';

export class LoginResponseDto {
  @IsNotEmpty() @IsNumber() @Expose() id!: number;
  @IsEnum(Role) @IsNotEmpty() @Expose() role!: Role;
}