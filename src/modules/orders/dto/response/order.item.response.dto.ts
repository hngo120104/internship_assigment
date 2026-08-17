import { Expose, Transform } from 'class-transformer';
import { OrderItem } from '../../entities/order.item.entity';

export class OrderItemResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'order_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  orderId!: string;

  @Expose({ name: 'product_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  productId!: string;

  @Expose({ name: 'variant_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  variantId!: string;

  @Expose({ name: 'product_name' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  productName!: string;

  @Expose({ name: 'variant_size' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  variantSize?: string;

  @Expose({ name: 'variant_color' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  variantColor?: string;

  @Expose()
  quantity!: number;

  @Expose({ name: 'unit_price' })
  @Transform(({ obj, key }) => Number(obj[key]), { toClassOnly: true })
  unitPrice!: number;

  @Expose()
  note?: string;

  @Expose({ name: 'line_total' })
  @Transform(
    ({ obj }) => {
      const item = obj as OrderItem;
      return item.quantity * Number(item.unitPrice);
    },
    { toClassOnly: true },
  )
  lineTotal!: number;

  @Expose({ name: 'created_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  createdAt!: Date;

  @Expose({ name: 'updated_at' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  updatedAt!: Date;
}
