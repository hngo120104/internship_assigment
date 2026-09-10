import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { ProductPhotoResponseDto } from './product-photo.response.dto';

export class ProductPhotosResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'product_id' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  productId!: string;

  @Expose()
  @Type(() => ProductPhotoResponseDto)
  photos!: ProductPhotoResponseDto[];
}
