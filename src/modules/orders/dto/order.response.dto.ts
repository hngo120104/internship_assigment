import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { UserAddressesResponseDto } from '../../users/dto/user.addresses/user.addresses.response.dto';
import { OrderItemResponseDto } from './order.item.response.dto';

@Exclude()
export class OrderResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userId' })
  user_id!: string;

  @Expose({ name: 'shopId' })
  shop_id!: string;

  @Expose({ name: 'shipAddressId' })
  recipient_address_id!: string;

  @Expose({ name: 'orderCode' })
  order_code?: string;

  @Type(() => UserAddressesResponseDto)
  @Expose({ name: 'shipAddress' })
  ship_address?: UserAddressesResponseDto;

  @Expose({ name: 'orderStatus' })
  order_status!: OrderStatus;

  @Expose({ name: 'paymentStatus' })
  payment_status!: PaymentStatus;

  @Expose()
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  discount!: number;

  @Expose({ name: 'shippingFee' })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  shipping_fee!: number;

  @Expose({ name: 'orderItems' })
  @Type(() => OrderItemResponseDto)
  order_items!: OrderItemResponseDto[];

  @Expose()
  @Transform(
    ({ obj }) => {
      const order = obj as Order;
      return (order.orderItems ?? []).reduce(
        (total: number, item: { quantity: number; unitPrice: number }) =>
          total + item.quantity * Number(item.unitPrice),
        0,
      );
    },
    { toClassOnly: true },
  )
  sub_total!: number;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;
}
