import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { RoleResponseDto } from '../../users/dto/role/role.response.dto';
import { User } from '../../users/entities/user.entity';
import { UserShopResponseDto } from '../../users/dto/user.shop/user.shop.response.dto';

export class LoginResponseDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => RoleResponseDto)
  @Transform(
    ({ obj }: TransformFnParams) => {
      const user = obj as User;
      return user.userRoles?.map((userRole) => userRole.role) ?? [];
    },
    { toClassOnly: true },
  )
  roles!: RoleResponseDto[];

  @Expose()
  @Type(() => UserShopResponseDto)
  shop?: UserShopResponseDto;

  @Expose() access_token!: string;
}
