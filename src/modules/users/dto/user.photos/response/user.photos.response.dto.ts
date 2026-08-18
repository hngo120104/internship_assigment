import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { UserPhotoResponseDto } from './user.photos.insert.response.dto';

export class UserPhotosResponseDto {
  @Expose({ name: 'user_id' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  userId!: string;

  @Expose()
  @Type(() => UserPhotoResponseDto)
  photos!: UserPhotoResponseDto[];
}
