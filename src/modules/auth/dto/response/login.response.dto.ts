import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { RoleResponseDto } from '../../../users/dto/role/response/role.response.dto';
import { User } from '../../../users/entities/user.entity';
import { UserShopResponseDto } from '../../../users/dto/user.shop/response/user.shop.response.dto';

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
  @Type(() => UserShopResponseDto)
  shop?: UserShopResponseDto;

  @Expose({ name: 'access_token' }) accessToken!: string;
}
