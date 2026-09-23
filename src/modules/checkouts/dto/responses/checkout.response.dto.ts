import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { ShopOrderResponseDto } from '../../../orders/dto/response/shop-order.response.dto';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { UserAddressResponseDto } from '../../../users/dto/user-addresses/response/user-address.response.dto';

export class CheckoutResponseDto {
  id!: string;

  @Expose({ name: 'checkout_status' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  status!: string;

  @Type(() => UserAddressResponseDto)
  @Expose({
    name: 'shipping_address',
    groups: ['order-details', 'customer-order'],
  })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  shippingAddress!: UserAddressResponseDto;

  @Expose({ name: 'payment_method' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  paymentMethod!: PaymentMethod;

  @Expose({ name: 'payment_status' })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  paymentStatus!: PaymentStatus;

  @Expose()
  @Type(() => ShopOrderResponseDto)
  orders!: ShopOrderResponseDto[];

  @Expose({ name: 'grand_total' })
  // @Transform(
  //   ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
  //   {
  //     toClassOnly: true,
  //   },
  // )
  grandTotal!: number;
}
