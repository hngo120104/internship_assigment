import { IsInt, Min } from 'class-validator';

export class CartItemsUpdateRequestDto {
  @Min(1)
  @IsInt()
  quantity!: number;
}
