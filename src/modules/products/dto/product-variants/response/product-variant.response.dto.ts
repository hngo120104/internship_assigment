import { Expose, Transform, TransformFnParams } from 'class-transformer';
import { ProductSize } from '../../../enums/product-size.enum';
import { ProductVariant } from '../../../entities/product-variant.entity';

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
  @Transform(({ obj }: TransformFnParams) => {
    const variant = obj as ProductVariant;
    const photo = variant.photo;
    return [photo?.id, photo?.url];
  })
  photo!: { id: string; thumbnail: string };

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
