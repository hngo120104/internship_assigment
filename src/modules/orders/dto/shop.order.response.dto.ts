import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../entities/order.entity';
import { UserAddressesResponseDto } from '../../users/dto/user.addresses/user.addresses.response.dto';
import { OrderItemResponseDto } from './order.item.response.dto';

@Exclude()
export class ShopOrderResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userId' })
  user_id!: string;

  @Expose({ name: 'shopId' })
  shop_id!: string;

  @Expose({ name: 'shipAddressId' })
  recipient_address_id!: string;

  @Expose({ name: 'orderCode', groups: ['customer-order'] })
  order_code?: string;

  @Type(() => UserAddressesResponseDto)
  @Expose({ name: 'shipAddress', groups: ['customer-order'] })
  ship_address?: UserAddressesResponseDto;

  @Expose({ name: 'orderStatus', groups: ['customer-order'] })
  order_status!: OrderStatus;

  @Expose({ name: 'paymentStatus', groups: ['customer-order'] })
  payment_status!: PaymentStatus;

  @Expose({ name: 'paymentMethod', groups: ['customer-order'] })
  payment_method!: PaymentMethod;

  @Expose({ groups: ['customer-order'] })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  discount!: number;

  @Expose({ name: 'shippingFee', groups: ['customer-order'] })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  shipping_fee!: number;

  @Expose({ name: 'orderItems', groups: ['customer-order'] })
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

  @Expose({ name: 'createdAt', groups: ['customer-order'] })
  created_at!: Date;

  @Expose({ name: 'updatedAt', groups: ['customer-order'] })
  updated_at!: Date;
}
