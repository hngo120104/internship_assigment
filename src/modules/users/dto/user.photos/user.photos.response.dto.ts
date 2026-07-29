import { Exclude, Expose, Type } from 'class-transformer';
import { UserPhotoResponseDto } from './user.photos.insert.response.dto';

@Exclude()
export class UserPhotosResponseDto {
  @Expose({ name: 'userId' })
  user_id!: string;

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos!: UserPhotoResponseDto[];
}
