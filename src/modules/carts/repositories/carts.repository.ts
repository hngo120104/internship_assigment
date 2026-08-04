import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartStatus } from '../entities/cart.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class CartsRepository {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepo: Repository<Cart>,
  ) {}

  async findOrCreateActiveCart(owner: {
    userId?: string;
    guestId?: string;
  }): Promise<Cart> {
    const existCart = await this.getActiveCart(owner);

    if (existCart) {
      return existCart;
    }

    const newCart = this.cartsRepo.create({
      id: randomUUID(),
      userId: owner.userId ?? undefined,
      guestId: owner.userId ? undefined : owner.guestId,
      cartStatus: CartStatus.ACTIVE,
    });

    return this.cartsRepo.save(newCart);
  }

  async findCartByUserId(userId: string): Promise<Cart | null> {
    const foundUserCart = await this.cartsRepo.findOne({
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
    return foundUserCart;
  }

  async findCartByGuestId(guestId: string): Promise<Cart | null> {
    const foundGuestCart = await this.cartsRepo.findOne({
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
    return foundGuestCart;
  }

  async getActiveCart(owner: {
    userId?: string;
    guestId?: string;
  }): Promise<Cart | null> {
    const where = owner.userId
      ? {
          userId: owner.userId,
          cartStatus: CartStatus.ACTIVE,
        }
      : {
          guestId: owner.guestId,
          cartStatus: CartStatus.ACTIVE,
        };
    const foundCart = await this.cartsRepo.findOne({
      where,
      relations: {
        cartItems: {
          product: true,
        },
      },
    });
    return foundCart;
  }

  async saveCart(newCart: Cart): Promise<Cart> {
    return this.cartsRepo.save(newCart);
  }
}
