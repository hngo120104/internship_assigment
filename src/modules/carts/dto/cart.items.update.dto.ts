import { IsInt, Min } from 'class-validator';

export class CartItemsUpdateDto {
  @Min(1)
  @IsInt()
  quantity!: number;
}
