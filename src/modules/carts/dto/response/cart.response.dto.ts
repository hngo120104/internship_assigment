import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { CartItemResponseDto } from './cart.item.response.dto';

interface UserCartLike {
  userId: string;
  cartItems: Array<{
    quantity: number;
    product?: { price: number };
  }>;
}

export class UserCartResponseDto {
  @Expose({ name: 'user_id' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  userId?: string;

  @Expose({ name: 'cart_items' })
  @Transform(({ obj, key }) => obj[key], { toClassOnly: true })
  @Type(() => CartItemResponseDto)
  cartItems!: CartItemResponseDto[];

  @Expose({ name: 'sub_total' })
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
  subTotal!: number;
}
