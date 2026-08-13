import { Transform, Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { RoleResponseDto } from '../../role/response/role.response.dto';
import { UserPhotoResponseDto } from '../../user.photos/response/user.photos.insert.response.dto';
import { UserShopResponseDto } from '../../user.shop/response/user.shop.response.dto';
import { TransformFnParams } from 'class-transformer';
import { User, UserStatus } from '../../../entities/user.entity';
import { UserAddressResponseDto } from '../../user.addresses/response/user.address.reponse.dto';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'user_name' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
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
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  userStatus!: UserStatus;

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos?: UserPhotoResponseDto[];

  @Expose()
  @Type(() => UserAddressResponseDto)
  addresses!: UserAddressResponseDto[];

  @Expose()
  @Type(() => UserShopResponseDto)
  shop?: UserShopResponseDto;

  @Expose({ name: 'created_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  createdAt!: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  updatedAt!: Date;
}
