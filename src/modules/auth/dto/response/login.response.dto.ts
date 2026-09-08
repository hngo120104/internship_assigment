import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { RoleResponseDto } from '../../../users/dto/roles/response/role.response.dto';
import { User } from '../../../users/entities/user.entity';
import { ShopResponseDto } from '../../../users/dto/shops/response/shop.response.dto';

export class LoginResponseDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => RoleResponseDto)
  @Transform(
    ({ obj }: TransformFnParams) => {
      const user = obj as User;
      return user.userRoles?.map((userRole) => userRole.role.name) ?? [];
    },
    { toClassOnly: true },
  )
  roles!: RoleResponseDto[];

  @Expose()
  @Type(() => ShopResponseDto)
  shop?: ShopResponseDto;

  @Expose({ name: 'access_token' }) accessToken!: string;
}
