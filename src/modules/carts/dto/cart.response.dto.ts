import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { CartItemResponseDto } from './cart.item.response.dto';
import { Cart } from '../entities/cart.entity';

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  ORDERED = 'ORDERED',
  EXPIRED = 'EXPIRED',
}

@Exclude()
export class CartResponseDto {
  @Expose()
  id!: string;

  @Expose({ name: 'userId' })
  user_id?: string;

  @Expose({ name: 'cartStatus' })
  cart_status!: CartStatus;

  @Expose({ name: 'cartItems' })
  @Type(() => CartItemResponseDto)
  cart_items!: CartItemResponseDto[];

  @Expose()
  @Transform(({ obj }) => {
    const cart = obj as Cart;
    return (cart.cartItems ?? []).reduce(
      (
        total: number,
        item: { quantity: number; product?: { price: number } },
      ) => (total = total + item.quantity * (item.product?.price ?? 0)),
      0,
    );
  })
  sub_total!: number;

  @Expose({ name: 'createdAt' })
  created_at!: Date;

  @Expose({ name: 'updatedAt' })
  updated_at!: Date;
}
