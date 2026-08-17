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

export class OrderItemCreateRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @Expose({ name: 'variant_id' })
  variantId!: string;

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
