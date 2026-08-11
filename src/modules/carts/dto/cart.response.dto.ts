import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { CartItemResponseDto } from './cart.item.response.dto';

interface UserCartLike {
  userId: string;
  cartItems: Array<{
    quantity: number;
    product?: { price: number };
  }>;
}

@Exclude()
export class UserCartResponseDto {
  @Expose({ name: 'userId' })
  user_id?: string;

  @Expose({ name: 'cartItems' })
  @Type(() => CartItemResponseDto)
  cart_items!: CartItemResponseDto[];

  @Expose()
  @Transform(({ obj }: { obj: UserCartLike }) => {
    const items = obj.cartItems;
    return items.reduce(
      (
        total: number,
        item: { quantity: number; product?: { price: number } },
      ) => (total = total + item.quantity * (item.product?.price ?? 0)),
      0,
    );
  })
  sub_total!: number;
}
