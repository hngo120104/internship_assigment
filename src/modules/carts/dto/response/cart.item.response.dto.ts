import { Expose, Transform, Type } from 'class-transformer';
import { ProductResponseDto } from '../../../products/dto/products/response/product.response.dto';
import { CartItem } from '../../entities/cart.item.entity';

export class CartItemResponseDto {
  @Expose()
  id!: string;

  @Expose()
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;

  @Expose()
  quantity!: number;

  @Expose({ name: 'line_total' })
  @Transform(({ obj }) => {
    const item = obj as CartItem;
    return item.quantity * item.product?.price;
  })
  lineTotal!: number;
}
