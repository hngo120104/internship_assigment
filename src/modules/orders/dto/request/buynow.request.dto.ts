import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
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
}
