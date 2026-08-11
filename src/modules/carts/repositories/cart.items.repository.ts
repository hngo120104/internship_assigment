import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from '../entities/cart.item.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepo: Repository<CartItem>,
  ) {}

  async findCartItemByCartIdAndProductId(
    cartId: string,
    productId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepo.findOne({
      where: {
        cartId,
        productId,
      },
      relations: {
        product: true,
        cart: true,
      },
    });
  }

  async findCartItemById(cartItemId: string): Promise<CartItem | null> {
    return await this.cartItemsRepo.findOne({
      where: { id: cartItemId },
      relations: { product: true },
    });
  }

  async getCartIdFromCartItemId(
    cartItemId: string,
  ): Promise<string | undefined> {
    return await this.cartItemsRepo
      .createQueryBuilder()
      .select('cart_id')
      .where('id = :id', { id: cartItemId })
      .getRawOne<string>();
  }

  async createCartItem(
    cartId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem> {
    const newCartItem = this.cartItemsRepo.create({
      cartId: cartId,
      productId: productId,
      quantity,
    });
    return await this.cartItemsRepo.save(newCartItem);
  }

  async saveCartItem(cartItem: CartItem): Promise<CartItem> {
    return this.cartItemsRepo.save(cartItem);
  }

  async deleteCartItem(cartItemId: string): Promise<boolean> {
    const cartItemToDelete = await this.cartItemsRepo.delete(cartItemId);
    return cartItemToDelete.affected !== 0;
  }

  async deleteAllCartItems(cartId: string): Promise<boolean> {
    const cartItemToDelete = await this.cartItemsRepo.delete({
      cartId: cartId,
    });
    return cartItemToDelete.affected !== 0;
  }
}
