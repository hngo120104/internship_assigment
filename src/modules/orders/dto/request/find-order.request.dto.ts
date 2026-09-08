import { Expose } from 'class-transformer';
import { OrderStatus, PaymentStatus } from '../../entities/order.entity';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination.request.dto';

export class FindOrderRequestDto extends PaginationQueryDto {
  @Expose({ name: 'order_status' })
  @IsEnum(OrderStatus)
  @IsOptional()
  orderStatus?: OrderStatus;

  @Expose({ name: 'payment_status' })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;
}
