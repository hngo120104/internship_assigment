import { Transform, Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { RoleResponseDto } from '../role/role.response.dto';
import { UserPhotoResponseDto } from '../user.photos/user.photos.insert.response.dto';
import { UserShopResponseDto } from '../user.shop/user.shop.response.dto';
import { TransformFnParams } from 'class-transformer';
import { User, UserStatus } from '../../entities/user.entity';
import { UserAddressesReponseDto } from '../user.addresses/user.addresses.reponse.dto';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userName' })
  user_name!: string;

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

  @Expose({ name: 'userStatus' })
  user_status!: UserStatus;

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos?: UserPhotoResponseDto[];

  @Expose()
  @Type(() => UserAddressesReponseDto)
  addresses!: UserAddressesReponseDto[];

  @Expose()
  @Type(() => UserShopResponseDto)
  shop?: UserShopResponseDto;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;
}
