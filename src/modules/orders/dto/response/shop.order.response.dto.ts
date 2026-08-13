import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../../entities/order.entity';
import { UserAddressResponseDto } from '../../../users/dto/user.addresses/response/user.address.reponse.dto';
import { OrderItemResponseDto } from './order.item.response.dto';

export class ShopOrderResponseDto {
  @Expose({ groups: ['order-details', 'customer-order'] })
  id!: string;

  @Expose({ name: 'user_id', groups: ['order-details'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  userId!: string;

  @Expose({ name: 'shop_id', groups: ['order-details', 'customer-order'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  shopId!: string;

  @Expose({ name: 'order_code', groups: ['customer-order', 'order-details'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  orderCode?: string;

  @Type(() => UserAddressResponseDto)
  @Expose({ name: 'ship_address', groups: ['order-details', 'order-details'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  shipAddress?: UserAddressResponseDto;

  @Expose({ name: 'order_status', groups: ['customer-order', 'order-details'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  orderStatus!: OrderStatus;

  @Expose({
    name: 'payment_status',
    groups: ['customer-order', 'order-details'],
  })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  paymentStatus!: PaymentStatus;

  @Expose({
    name: 'payment_method',
    groups: ['customer-order', 'order-details'],
  })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  paymentMethod!: PaymentMethod;

  @Expose({ groups: ['customer-order', 'order-details'] })
  @Transform(({ value }) => Number(value), { toClassOnly: true })
  discount!: number;

  @Expose({ name: 'shipping_fee', groups: ['customer-order', 'order-details'] })
  @Transform(({ obj, key }) => Number(obj[key]), { toClassOnly: true })
  shippingFee!: number;

  @Expose({ name: 'order_items', groups: ['customer-order', 'order-details'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  @Type(() => OrderItemResponseDto)
  orderItems!: OrderItemResponseDto[];

  @Expose({ name: 'sub_total', groups: ['order-details', 'customer-order'] })
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
  subTotal!: number;

  @Expose({ name: 'created_at', groups: ['customer-order', 'order-details'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  createdAt!: Date;

  @Expose({ name: 'updated_at', groups: ['customer-order', 'order-details'] })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  updatedAt!: Date;
}
