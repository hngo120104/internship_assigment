import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrderItemCreateDto } from './order.item.create.dto';

@Exclude()
export class BuyNowRequestDto extends OrderItemCreateDto {
  @Expose({ name: 'ship_address_id' })
  @IsUUID()
  @IsNotEmpty()
  shipAddressId!: string;
}
