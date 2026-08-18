import { Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsUUID, Max, Min } from 'class-validator';
import { OrderItemCreateRequestDto } from './order.item.create.request.dto';
import { PaymentMethod } from '../../entities/order.entity';

export class BuyNowRequestDto extends OrderItemCreateRequestDto {
  @Expose({ name: 'ship_address_id' })
  @IsUUID()
  @IsNotEmpty()
  shipAddressId!: string;

  @IsNotEmpty()
  @Expose({ name: 'payment_method' })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsNotEmpty()
  @Min(1)
  @Max(10000, { message: 'Quantity cannot exceed 10000.' })
  quantity!: number;
}
