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
        variant: { product: { photos: true } },
        user: true,
      },
    });
  }

  async findActiveCartItemsByUserIdAndIds(
    userId: string,
    cartItemIds: string[],
  ): Promise<CartItem[]> {
    return await this.cartItemsRepository.find({
      select: { id: true, variantId: true, quantity: true },
      where: {
        id: In(cartItemIds),
        userId: userId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      order: { updatedAt: 'DESC' },
    });
  }

  async findAllUserActiveCartItemsByUserId(
    userId: string,
    page: number,
    size: number,
  ): Promise<[CartItem[], number]> {
    return await this.cartItemsRepository.findAndCount({
      where: {
        userId: userId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      relations: {
        variant: { photo: true },
      },
      order: {
        updatedAt: 'DESC',
      },
      take: size,
      skip: (page - 1) * size,
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
        variant: { photo: true },
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
      relations: { variant: { photo: true } },
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
