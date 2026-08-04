import { Expose } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CartItemsAddRequestDto {
  @IsUUID()
  @Expose({ name: 'product_id' })
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
