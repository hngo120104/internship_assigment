import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem, CartItemStatus } from '../entities/cart-item.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class CartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepository: Repository<CartItem>,
  ) {}

  async findActiveCartItemByUserIdAndVariantId(
    userId: string,
    variantId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepository.findOne({
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
    return await this.cartItemsRepository
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

  async findActiveCartItemsByUserIdAndVariantIdsAndLock(
    userId: string,
    variantIds: string[],
  ): Promise<CartItem[]> {
    return await this.cartItemsRepository
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
    return await this.cartItemsRepository.find({
      where: {
        userId: userId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      relations: {
        variant: { product: true },
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findAllActiveCartItemsPaginated(
    page: number,
    size: number,
  ): Promise<[CartItem[], number]> {
    return await this.cartItemsRepository.findAndCount({
      where: {
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      relations: {
        variant: { product: true },
      },
      order: {
        createdAt: 'ASC',
      },
      skip: (page - 1) * size,
      take: size,
    });
  }

  async findActiveCartItemByUserIdAndCartItemId(
    userId: string,
    cartItemId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepository.findOne({
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
    const newCartItem = this.cartItemsRepository.create({
      userId: userId,
      variantId,
      quantity: quantity,
      cartItemStatus: CartItemStatus.ACTIVE,
    });
    return await this.cartItemsRepository.save(newCartItem);
  }

  async updateUserCartItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<boolean> {
    const updateResult = await this.cartItemsRepository.update(
      { id: cartItemId, userId: userId },
      { quantity: quantity },
    );
    return updateResult.affected === 1;
  }

  async saveCartItem(cartItem: CartItem): Promise<CartItem> {
    return this.cartItemsRepository.save(cartItem);
  }

  async userSoftDeleteCartItem(
    userId: string,
    cartItemId: string,
  ): Promise<number> {
    const deleteResult = await this.cartItemsRepository.update(
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
    const cartItemToDelete = await this.cartItemsRepository.update(
      {
        userId: userId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      { isDeleted: true, cartItemStatus: CartItemStatus.EXPIRED },
    );
    return cartItemToDelete.affected ?? 0;
  }

  async markUserActiveCartItemsAsOrdered(
    userId: string,
    cartItemIds: string[],
  ): Promise<number> {
    const updateResult = await this.cartItemsRepository.update(
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

  async softDeleteAbandonedCartItems(cutoffDate: Date): Promise<number> {
    const deleteResult = await this.cartItemsRepository
      .createQueryBuilder()
      .update(CartItem)
      .set({ isDeleted: true, cartItemStatus: CartItemStatus.EXPIRED })
      .where('updatedAt < :cutoffDate', { cutoffDate })
      .andWhere('isDeleted = false')
      .andWhere('cartItemStatus = :status', { status: CartItemStatus.ACTIVE })
      .execute();
    return deleteResult.affected ?? 0;
  }
}
