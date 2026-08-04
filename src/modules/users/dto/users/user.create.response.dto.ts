import { Transform, TransformFnParams, Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { User, UserStatus } from '../../entities/user.entity';
import { UserPhotoResponseDto } from '../user.photos/user.photos.insert.response.dto';
import { RoleResponseDto } from '../role/role.response.dto';

export class UserCreateResponseDto {
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

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;

  @Expose()
  access_token!: string;
}
