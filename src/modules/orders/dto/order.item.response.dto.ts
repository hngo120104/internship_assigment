import { Expose, Transform, Type } from 'class-transformer';
import { ProductResponseDto } from '../../products/dto/products/product.response.dto';
import { OrderItem } from '../entities/order.item.entity';

export class OrderItemResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'orderId' })
  order_id!: string;

  @Expose({ name: 'productId' })
  product_id!: string;

  @Expose()
  @Type(() => ProductResponseDto)
  product!: ProductResponseDto;

  @Expose({ name: 'productName' })
  product_name!: string;

  @Expose()
  quantity!: number;

  @Expose({ name: 'unitPrice' })
  unit_price!: number;

  @Expose()
  @Transform(({ obj }) => {
    const item = obj as OrderItem;
    return Number(item.quantity * item.unitPrice);
  })
  line_total!: number;
}
