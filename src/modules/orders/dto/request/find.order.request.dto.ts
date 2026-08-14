import { Expose } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../../entities/order.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class FindOrderRequestDto {
  @Expose({ name: 'order_status' })
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;

  @Expose({ name: 'payment_status' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
