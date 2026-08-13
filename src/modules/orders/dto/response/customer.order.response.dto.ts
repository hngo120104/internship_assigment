import { Expose, Type } from 'class-transformer';
import { ShopOrderResponseDto } from './shop.order.response.dto';

export class CheckoutResponseDto {
  @Expose()
  @Type(() => ShopOrderResponseDto)
  orders!: ShopOrderResponseDto[];

  @Expose({ name: 'grand_total' })
  grandTotal!: number;
}
