import { Exclude, Expose, Type } from 'class-transformer';
import { ShopOrderResponseDto } from './shop.order.response.dto';

@Exclude()
export class CustomerOrderCreateResponseDto {
  @Expose()
  @Type(() => ShopOrderResponseDto)
  orders!: ShopOrderResponseDto[];

  @Expose({ name: 'grandTotal' })
  grand_total!: number;
}
