import { ProductVariant } from '../../products/entities/product-variant.entity';

export interface RequestedOrderItem {
  variant: ProductVariant;
  quantity: number;
  note?: string;
}
