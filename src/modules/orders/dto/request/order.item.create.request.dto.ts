import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class OrderItemCreateRequestDto {
  @IsUUID()
  @IsNotEmpty()
  @Expose({ name: 'variant_id' })
  variantId!: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
