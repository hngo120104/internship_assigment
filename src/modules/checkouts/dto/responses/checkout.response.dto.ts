import { Expose, Transform, TransformFnParams, Type } from 'class-transformer';
import { ShopOrderResponseDto } from '../../../orders/dto/response/shop-order.response.dto';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { UserAddressResponseDto } from '../../../users/dto/user-addresses/response/user-address.response.dto';

export class CheckoutResponseDto {
  @Type(() => UserAddressResponseDto)
  @Expose({ name: 'ship_address', groups: ['order-details', 'customer-order'] })
  @Transform(
    ({ obj, key }: TransformFnParams) => (obj as Record<string, string>)[key],
    {
      toClassOnly: true,
    },
  )
  shipAddress?: UserAddressResponseDto;

  @Expose({ name: 'payment_method' })
  paymentMethod!: PaymentMethod;

  @Expose({ name: 'payment_status' })
  paymentStatus!: PaymentStatus;

  @Expose()
  @Type(() => ShopOrderResponseDto)
  orders!: ShopOrderResponseDto[];

  @Expose({ name: 'grand_total' })
  grandTotal!: number;
}
