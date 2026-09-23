import { Expose } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';
import { OrderItemCreateRequestDto } from '../../../orders/dto/request/order-item-create.request.dto';
import { PaymentMethod } from '../../enums/payment-method.enum';

export class BuyNowRequestDto extends OrderItemCreateRequestDto {
  @Expose({ name: 'idempotency_key' })
  @IsNotEmpty()
  idempotencyKey!: string;

  @Expose({ name: 'ship_address_id' })
  @IsUUID()
  @IsNotEmpty()
  shippingAddressId!: string;

  @IsNotEmpty()
  @Expose({ name: 'payment_method' })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(10000, { message: 'Quantity cannot exceed 10000.' })
  quantity!: number;
}
