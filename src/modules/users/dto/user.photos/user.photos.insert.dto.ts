import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PhotoType } from '../../entities/user.photo.entity';

export class UserPhotosInsertDto {
  @IsNotEmpty()
  @IsString()
  url!: string;

  @IsNotEmpty()
  @IsEnum(PhotoType)
  type!: PhotoType;
}
