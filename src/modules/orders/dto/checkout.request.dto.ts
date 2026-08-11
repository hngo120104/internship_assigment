import { Exclude, Expose, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { OrderItemCreateDto } from './order.item.create.dto';

@Exclude()
export class CheckoutRequestDto {
  @Expose({ name: 'ship_address_id' })
  @IsUUID()
  @IsNotEmpty()
  shipAddressId!: string;

  @Expose()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((item: OrderItemCreateDto) => item.productId, {
    message: 'Products in an order cannot be duplicated.',
  })
  @ValidateNested({ each: true })
  @Type(() => OrderItemCreateDto)
  items!: OrderItemCreateDto[];
}
