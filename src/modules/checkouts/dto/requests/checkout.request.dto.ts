import { Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../enums/payment-method.enum';
import { CheckoutItemRequestDto } from './checkout-item.request.dto';

export class CheckoutRequestDto {
  @Expose({ name: 'idempotency_key' })
  @IsNotEmpty()
  idempotencyKey!: string;

  @Expose({ name: 'ship_address_id' })
  @IsUUID()
  @IsNotEmpty()
  shippingAddressId!: string;

  @Expose({ name: 'order_items' })
  @IsNotEmpty()
  @IsArray()
  @ArrayUnique((item: CheckoutItemRequestDto) => item.cartItemId, {
    message: 'Cart item cannot be duplicated.',
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemRequestDto)
  checkoutItems!: CheckoutItemRequestDto[];

  @Expose({ name: 'payment_method' })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
