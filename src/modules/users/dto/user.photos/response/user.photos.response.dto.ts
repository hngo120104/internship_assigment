import { Expose, Transform, Type } from 'class-transformer';
import { UserPhotoResponseDto } from './user.photos.insert.response.dto';

export class UserPhotosResponseDto {
  @Expose({ name: 'user_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  userId!: string;

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos!: UserPhotoResponseDto[];
}
