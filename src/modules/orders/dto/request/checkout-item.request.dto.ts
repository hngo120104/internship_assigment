import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CheckoutItemRequestDto {
  @Expose({ name: 'cart_item_id' })
  @IsUUID()
  @IsNotEmpty()
  cartItemId!: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
