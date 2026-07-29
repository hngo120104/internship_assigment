import { Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { RoleResponseDto } from '../role/role.response.dto';
import { UserPhotoResponseDto } from '../user.photos/user.photos.insert.response.dto';
import { UserShopResponseDto } from '../user.shop/user.shop.response.dto';

export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userName' })
  user_name!: string;

  @Expose()
  email!: string;

  @Type(() => RoleResponseDto)
  @Expose()
  roles!: RoleResponseDto[];

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos?: UserPhotoResponseDto[];

  @Expose()
  @Type(() => UserShopResponseDto)
  shop?: UserShopResponseDto;

  @Expose({ name: 'createdAt' }) created_at!: Date;
}
