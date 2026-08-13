import { Exclude, Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../../entities/order.entity';
import { OrderItemCreateRequestDto } from './order.item.create.request.dto';

export class CheckoutRequestDto {
  @Expose({ name: 'ship_address_id' })
  @IsUUID()
  @IsNotEmpty()
  shipAddressId!: string;

  @Expose({ name: 'order_items' })
  @IsNotEmpty()
  @IsArray()
  @ArrayUnique((item: OrderItemCreateRequestDto) => item.productId, {
    message: 'Product cannot be duplicated.',
  })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemCreateRequestDto)
  orderItems!: OrderItemCreateRequestDto[];

  @Expose({ name: 'payment_method' })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
