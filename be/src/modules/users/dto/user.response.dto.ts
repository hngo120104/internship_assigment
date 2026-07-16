import { Type } from 'class-transformer';
import { Expose } from 'class-transformer';
import { Role } from '../../auth/guards/role/role.enum';
import { UserPhotosInsertResponseDto } from './user.photos.insert.response.dto';

export class UserResponseDto {
  @Expose() id!: number;
  @Expose() username!: string;
  @Expose() full_name?: string;
  @Expose() email!: string;
  @Expose() role!: Role;
  @Expose() @Type(() => UserPhotosInsertResponseDto) photos?: UserPhotosInsertResponseDto[];
  @Expose() createdAt!: Date;
  @Expose() access_token!: string;
}
