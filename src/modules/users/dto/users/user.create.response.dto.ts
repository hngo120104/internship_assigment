import { Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { Role } from '../../../auth/guards/role/role.enum';
import { UserPhotoResponseDto } from '../user.photos/user.photos.insert.response.dto';
import { RoleResponseDto } from '../role/role.response.dto';

export class UserCreateResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userName' })
  user_name!: string;

  // @Expose()
  email!: string;

  @Type(() => RoleResponseDto)
  @Expose()
  roles!: RoleResponseDto[];

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos?: UserPhotoResponseDto[];

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;

  @Expose()
  access_token!: string;
}
