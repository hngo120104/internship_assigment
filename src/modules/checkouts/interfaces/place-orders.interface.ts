import { UserAddress } from '../../users/entities/user-address.entity';
import { PaymentMethod } from '../enums/payment-method.enum';
import { RequestedItemsByShop } from '../../orders/types/requested-item-by-shop.type';

export interface PlaceOrdersCommand {
  userId: string;
  idempotencyKey: string;
  shippingAddress: UserAddress;
  paymentMethod: PaymentMethod;
  itemsByShop: RequestedItemsByShop;
  cartItemIds?: string[];
}
