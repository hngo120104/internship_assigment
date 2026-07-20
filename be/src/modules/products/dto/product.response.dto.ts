import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductResponseDto {
  @Expose() id!: string;
  @Expose() shopId!: string;
  @Expose() name!: string;
  @Expose() type!: string;
  @Expose() description?: string;
  @Expose() price!: number;
  @Expose() stock!: number;
  @Expose() isActive!: boolean;
}
