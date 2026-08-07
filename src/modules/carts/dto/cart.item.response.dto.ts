import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ProductResponseDto } from '../../products/dto/products/product.response.dto';
import { CartItem } from '../entities/cart.item.entity';

@Exclude()
export class CartItemResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'productId' })
  product_id!: string;

  @Expose()
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;

  @Expose()
  quantity!: number;

  @Expose()
  @Transform(({ obj }) => {
    const item = obj as CartItem;
    return item.quantity * item.product?.price;
  })
  line_total!: number;
}
