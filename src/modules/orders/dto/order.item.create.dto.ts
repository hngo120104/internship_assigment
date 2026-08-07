import { Expose } from 'class-transformer';
import { IsInt, IsNotEmpty, IsUUID } from 'class-validator';

export class OrderItemCreateDto {
  @IsUUID()
  @IsNotEmpty()
  @Expose({ name: 'product_id' })
  productId!: string;

  @IsInt()
  quantity!: number;
}
