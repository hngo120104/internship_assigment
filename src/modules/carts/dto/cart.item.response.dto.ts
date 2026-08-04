import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ProductResponseDto } from '../../products/dto/products/product.response.dto';

@Exclude()
export class CartItemResponseDto {
  @Expose()
  id!: number;

  @Expose({ name: 'productId' })
  product_id!: string;

  @Expose()
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;

  @Expose()
  quantity!: number;

  @Expose()
  @Transform(({ obj }) => obj.quantity * (obj.product?.price ?? 0))
  line_total!: number;
}
