import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CartItemsService } from '../services/cart.items.service';

@Injectable()
export class CartItemCronJob {
  private readonly logger = new Logger(CartItemCronJob.name);

  constructor(private readonly cartItemsService: CartItemsService) {}

  @Cron('*/10000 * * * * *')
  async clearUserAbandonedCartItems() {
    this.logger.debug('Starting clean up user abandoned cart items');

    try {
      await this.cartItemsService.cleanupAbandonedCartItems();
    } catch (error) {
      this.logger.error('Failed to clean up abandoned cart item', error);
    }
  }
}
