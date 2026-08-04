import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem } from '../entities/cart.item.entity';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { Product } from '../../products/entities/product.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepo: Repository<CartItem>,
  ) {}

  async findCartItem(
    cartId: string,
    productId: string,
  ): Promise<CartItem | null> {
    const foundCartItem = await this.cartItemsRepo.findOne({
      where: {
        cartId,
        productId,
      },
    });
    return foundCartItem;
  }

  async createCartItem(
    cart: Cart,
    product: Product,
    quantity: number,
  ): Promise<CartItem> {
    const newCartItem = this.cartItemsRepo.create({
      id: randomUUID(),
      cart,
      cartId: cart.id,
      product,
      productId: product.id,
      quantity,
    });
    return await this.cartItemsRepo.save(newCartItem);
  }

  async saveCartItem(cartItem: CartItem): Promise<CartItem> {
    return this.cartItemsRepo.save(cartItem);
  }

  async removeCartItem(cartItem: CartItem) {
    return this.cartItemsRepo.remove(cartItem);
  }
}
