import { Expose } from 'class-transformer';
import { PhotoType } from '../../../entities/user-photo.entity';

export class UserPhotoResponseDto {
  @Expose()
  id!: string;

  @Expose()
  url!: string;

  @Expose()
  type!: PhotoType;
}
