import { Expose, Transform, Type } from 'class-transformer';
import { ProductResponseDto } from '../../../products/dto/products/response/product.response.dto';
import { CartItem } from '../../entities/cart.item.entity';
import { ProductVariantResponseDto } from '../../../products/dto/product.variants/response/product.variant.response.dto';

export class CartItemResponseDto {
  @Expose()
  id!: string;

  @Expose()
  @Transform(({ obj }) => (obj as CartItem).variant?.product, {
    toClassOnly: true,
  })
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;

  @Expose()
  @Type(() => ProductVariantResponseDto)
  variant!: ProductVariantResponseDto;

  @Expose()
  quantity!: number;

  @Expose({ name: 'line_total' })
  @Transform(({ obj }) => {
    const item = obj as CartItem;
    return item.quantity * Number(item.variant?.price ?? 0);
  })
  lineTotal!: number;
}
