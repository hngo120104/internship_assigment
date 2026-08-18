import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem, CartItemStatus } from '../entities/cart.item.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class CartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepo: Repository<CartItem>,
  ) {}

  async findActiveCartItemByUserIdAndVariantId(
    userId: string,
    variantId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepo.findOne({
      where: {
        userId: userId,
        variantId,
        cartItemStatus: CartItemStatus.ACTIVE,
        isDeleted: false,
      },
      relations: {
        variant: { product: true },
        user: true,
      },
    });
  }

  async findActiveCartItemByUserIdAndVariantIdAndLockForUpdate(
    userId: string,
    variantId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepo
      .createQueryBuilder('cart_items')
      .setLock('pessimistic_write')
      .where('cart_items.userId = :userId', { userId })
      .andWhere('cart_items.variantId = :variantId', {
        variantId: variantId,
      })
      .andWhere('cart_items.cartItemStatus = :status', {
        status: CartItemStatus.ACTIVE,
      })
      .andWhere('cart_items.isDeleted = false')
      .getOne();
  }

  async findActiveCartItemsByUserIdAndVariantIdsAndLockForUpdate(
    userId: string,
    variantIds: string[],
  ): Promise<CartItem[]> {
    return await this.cartItemsRepo
      .createQueryBuilder('cart_items')
      .setLock('pessimistic_write')
      .where('cart_items.userId = :userId', { userId })
      .andWhere('cart_items.variantId IN (:...variantIds)', {
        variantIds: variantIds,
      })
      .andWhere('cart_items.cartItemStatus = :status', {
        status: CartItemStatus.ACTIVE,
      })
      .andWhere('cart_items.isDeleted = false')
      .orderBy('cart_items.id', 'ASC')
      .getMany();
  }

  async findAllUserActiveCartItemsByUserId(
    userId: string,
  ): Promise<CartItem[]> {
    return await this.cartItemsRepo.find({
      where: {
        userId: userId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      relations: {
        variant: { product: true },
      },
    });
  }

  async findAllActiveCartItems(): Promise<CartItem[]> {
    return await this.cartItemsRepo.find({
      where: {
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      relations: {
        variant: { product: true },
      },
      order: {
        userId: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async findActiveCartItemByUserIdAndCartItemId(
    userId: string,
    cartItemId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepo.findOne({
      where: {
        id: cartItemId,
        userId: userId,
        cartItemStatus: CartItemStatus.ACTIVE,
        isDeleted: false,
      },
      relations: { variant: { product: true } },
    });
  }

  async createCartItem(
    userId: string,
    variantId: string,
    quantity: number,
  ): Promise<CartItem> {
    const newCartItem = this.cartItemsRepo.create({
      userId: userId,
      variantId,
      quantity: quantity,
      cartItemStatus: CartItemStatus.ACTIVE,
    });
    return await this.cartItemsRepo.save(newCartItem);
  }

  async saveCartItem(cartItem: CartItem): Promise<CartItem> {
    return this.cartItemsRepo.save(cartItem);
  }

  async softDeleteCartItem(
    userId: string,
    cartItemId: string,
  ): Promise<number> {
    const deleteResult = await this.cartItemsRepo.update(
      {
        userId: userId,
        id: cartItemId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      {
        isDeleted: true,
        cartItemStatus: CartItemStatus.EXPIRED,
      },
    );
    return deleteResult.affected ?? 0;
  }

  async softDeleteAllCartItemsOfUser(userId: string): Promise<number> {
    const cartItemToDelete = await this.cartItemsRepo.update(
      {
        userId: userId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      { isDeleted: true, cartItemStatus: CartItemStatus.EXPIRED },
    );
    return cartItemToDelete.affected ?? 0;
  }

  async markActiveCartItemsOfUserAsOrdered(
    userId: string,
    cartItemIds: string[],
  ): Promise<number> {
    const updateResult = await this.cartItemsRepo.update(
      {
        userId: userId,
        id: In(cartItemIds),
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      { cartItemStatus: CartItemStatus.ORDERED },
    );
    return updateResult.affected ?? 0;
  }
}
