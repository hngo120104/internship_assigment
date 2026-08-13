import { Expose } from 'class-transformer';
import { PhotoType } from '../../../entities/user.photo.entity';

export class UserPhotoResponseDto {
  @Expose()
  url!: string;

  @Expose()
  type!: PhotoType;
}
