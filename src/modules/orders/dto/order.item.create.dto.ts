import { Exclude, Expose } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

@Exclude()
export class OrderItemCreateDto {
  @IsUUID()
  @IsNotEmpty()
  @Expose({ name: 'product_id' })
  productId!: string;

  @Expose()
  @IsInt()
  @Min(1)
  quantity!: number;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
