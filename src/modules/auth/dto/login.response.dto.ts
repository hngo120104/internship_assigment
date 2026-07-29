import { Expose, Type } from 'class-transformer';
import { Role } from '../../auth/guards/role/role.enum';
import { RoleResponseDto } from '../../users/dto/role/role.response.dto';

export class LoginResponseDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => RoleResponseDto)
  roles!: RoleResponseDto[];

  @Expose() access_token!: string;
}
