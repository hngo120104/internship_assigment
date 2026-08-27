import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { ProductSize } from '../../../enum/product.size.enum';
import { ProductPhotoResponseDto } from '../../product.photos/response/product.photos.insert.response.dto';

export class ProductVariantResponseDto {
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

  @Expose({ name: 'variant_name' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  variantName!: string;

  @Expose()
  @Type(() => ProductPhotoResponseDto)
  photo!: ProductPhotoResponseDto;

  @Expose()
  size?: ProductSize;

  @Expose()
  color?: string;

  @Expose()
  amount!: number;

  @Expose()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  price!: number;

  @Expose({ name: 'is_active' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  isActive!: boolean;
}
