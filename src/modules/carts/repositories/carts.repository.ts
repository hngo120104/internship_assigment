import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartStatus } from '../entities/cart.entity';
import { CartItemsRepository } from './cart.items.repository';

@Injectable()
export class CartsRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepo: Repository<Cart>,
    private readonly cartItemsRepo: CartItemsRepository,
  ) {}

  async findActiveCarts(): Promise<Cart[]> {
    return await this.cartsRepo.find({
      where: { cartStatus: CartStatus.ACTIVE, isDeleted: false },
      relations: {
        user: true,
        cartItems: {
          product: true,
        },
      },
    });
  }

  async findOrCreateActiveCart(owner: {
    userId?: string;
    guestId?: string;
  }): Promise<Cart> {
    const existCart = await this.getActiveCart(owner);

    if (existCart) {
      return existCart;
    }

    const newCart = this.cartsRepo.create({
      userId: owner.userId ?? undefined,
      guestId: owner.userId ? undefined : owner.guestId,
      cartStatus: CartStatus.ACTIVE,
    });

    return this.cartsRepo.save(newCart);
  }

  async findCartByUserId(userId: string): Promise<Cart | null> {
    return await this.cartsRepo.findOne({
      where: {
        userId,
        cartStatus: CartStatus.ACTIVE,
      },
      relations: {
        cartItems: {
          product: true,
        },
      },
    });
  }

  async findCartByGuestId(guestId: string): Promise<Cart | null> {
    return await this.cartsRepo.findOne({
      where: {
        guestId,
        cartStatus: CartStatus.ACTIVE,
      },
      relations: {
        cartItems: {
          product: true,
        },
      },
    });
  }

  async findCartByCartItemId(cartItemId: string): Promise<Cart | null> {
    const cartId = await this.cartItemsRepo.getCartIdFromCartItemId(cartItemId);
    return await this.cartsRepo.findOneBy({ id: cartId });
  }

  async getActiveCart(owner: {
    userId?: string;
    guestId?: string;
  }): Promise<Cart | null> {
    const where = owner.userId
      ? {
          userId: owner.userId,
          cartStatus: CartStatus.ACTIVE,
          isDeleted: false,
        }
      : {
          guestId: owner.guestId,
          cartStatus: CartStatus.ACTIVE,
          isDeleted: false,
        };
    return await this.cartsRepo.findOne({
      where,
      relations: {
        cartItems: {
          product: true,
        },
        user: true,
      },
    });
  }

  async saveCart(newCart: Cart): Promise<Cart> {
    return this.cartsRepo.save(newCart);
  }

  async softDeleteCart(userId: string): Promise<boolean> {
    const deleteResult = await this.cartsRepo.update(
      { userId: userId, isDeleted: false, cartStatus: CartStatus.ACTIVE },
      { isDeleted: true, cartStatus: CartStatus.EXPIRED },
    );
    return deleteResult.affected !== 0;
  }
}
