import { Exclude, Expose } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { OrderItemCreateDto } from './order.item.create.dto';
import { PaymentMethod } from '../entities/order.entity';

@Exclude()
export class BuyNowRequestDto extends OrderItemCreateDto {
  @Expose({ name: 'ship_address_id' })
  @IsUUID()
  @IsNotEmpty()
  shipAddressId!: string;

  @IsNotEmpty()
  @Expose({ name: 'payment_method' })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
