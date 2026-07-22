import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductResponseDto {
  @Expose() id!: number;
  @Expose() shopId!: number;
  @Expose() name!: string;
  @Expose() type!: string;
  @Expose() description?: string;
  @Expose() price!: number;
  @Expose() stock!: number;
  @Expose() isActive!: boolean;
}
