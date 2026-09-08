import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { RoleType } from '../../../entities/role.entity';
import { Expose } from 'class-transformer';

export class RoleCreateRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RoleType)
  @IsNotEmpty()
  @Expose({ name: 'role_type' })
  roleType!: RoleType;
}
