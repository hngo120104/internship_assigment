import { Expose, Transform } from 'class-transformer';
import { ProductSize } from '../../../enum/product.size.enum';

export class ProductVariantResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'product_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  productId!: string;

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
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  isActive!: boolean;
}
