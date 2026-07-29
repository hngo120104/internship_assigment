import { Exclude, Expose } from 'class-transformer';
import { PhotoType } from '../../entities/user.photo.entity';

@Exclude()
export class UserPhotoResponseDto {
  @Expose()
  url!: string;

  @Expose()
  type!: PhotoType;
}
