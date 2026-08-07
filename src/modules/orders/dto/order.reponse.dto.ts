import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { UserAddressesResponseDto } from '../../users/dto/user.addresses/user.addresses.response.dto';

@Exclude()
export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userId' })
  user_id!: string;

  @Expose({ name: 'shopId' })
  shop_id!: string;

  @Type(() => UserAddressesResponseDto)
  @Expose({ name: 'shipAddress' })
  ship_address!: UserAddressesResponseDto;

  @Expose({ name: 'orderStatus' })
  order_status!: OrderStatus;

  @Expose({ name: 'paymentStatus' })
  payment_status!: PaymentStatus;

  @Expose()
  discount!: number;

  @Expose({ name: 'shippingFee' })
  shipping_fee!: number;

  @Expose()
  note?: string;

  @Expose()
  @Transform(({ obj }) => {
    const order = obj as Order;
    return (order.orderItems ?? []).reduce(
      (
        total: number,
        item: { quantity: number; product?: { price: number } },
      ) => (total = total + item.quantity * (item.product?.price ?? 0)),
      0,
    );
  })
  sub_total!: number;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;
}
