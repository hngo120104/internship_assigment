import { UserAddress } from '../../users/entities/user-address.entity';
import { PaymentMethod } from '../entities/order.entity';
import { RequestedItemsByShop } from '../types/requested-item-by-shop.type';

export interface PlaceOrdersCommand {
  userId: string;
  shippingAddress: UserAddress;
  paymentMethod: PaymentMethod;
  itemsByShop: RequestedItemsByShop;
  cartItemIds?: string[];
}
