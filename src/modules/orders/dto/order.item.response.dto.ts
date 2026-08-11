import { Exclude, Expose, Transform } from 'class-transformer';
import { OrderItem } from '../entities/order.item.entity';

@Exclude()
export class OrderItemResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'orderId' })
  order_id!: string;

  @Expose({ name: 'productId' })
  product_id!: string;

  @Expose({ name: 'productName' })
  product_name!: string;

  @Expose()
  quantity!: number;

  @Expose({ name: 'unitPrice' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  unit_price!: number;

  @Expose()
  note?: string;

  @Expose()
  @Transform(
    ({ obj }) => {
      const item = obj as OrderItem;
      return item.quantity * Number(item.unitPrice);
    },
    { toClassOnly: true },
  )
  line_total!: number;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;
}
