import { Expose, Transform, TransformFnParams } from 'class-transformer';

export class ProductPhotoResponseDto {
  @Expose()
  url!: string;

  @Expose()
  description?: string;

  @Expose({ name: 'is_primary' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  isPrimary!: boolean;
}
