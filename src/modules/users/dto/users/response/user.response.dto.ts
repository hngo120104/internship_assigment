import { Transform, TransformFnParams, Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { RoleResponseDto } from '../../roles/response/role.response.dto';
import { UserPhotoResponseDto } from '../../user-photos/response/user-photo.response.dto';
import { ShopResponseDto } from '../../shops/response/shop.response.dto';
import { User, UserStatus } from '../../../entities/user.entity';
import { UserAddressResponseDto } from '../../user-addresses/response/user-address.response.dto';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'user_name' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  userName!: string;

  @Expose()
  email!: string;

  @Type(() => RoleResponseDto)
  @Expose()
  @Transform(
    ({ obj }: TransformFnParams) => {
      const user = obj as User;
      return user.userRoles?.map((userRole) => userRole.role) ?? [];
    },
    { toClassOnly: true },
  )
  roles!: RoleResponseDto[];

  @Expose({ name: 'user_status' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  userStatus!: UserStatus;

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos?: UserPhotoResponseDto[];

  @Expose()
  @Type(() => UserAddressResponseDto)
  addresses!: UserAddressResponseDto[];

  @Expose()
  @Type(() => ShopResponseDto)
  shop?: ShopResponseDto;

  @Expose({ name: 'created_at' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  createdAt!: Date;

  @Expose({ name: 'updated_at' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  updatedAt!: Date;
}
