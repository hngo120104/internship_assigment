import { Expose } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CartItemsUpdateRequestDto {
  @Expose({ name: 'product_id' })
  @IsUUID()
  productId!: string;

  @Min(1)
  @IsInt()
  quantity!: number;
}
