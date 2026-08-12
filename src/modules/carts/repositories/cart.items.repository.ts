import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem, CartItemStatus } from '../entities/cart.item.entity';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

@Injectable()
export class CartItemsRepository {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartItemsRepo: Repository<CartItem>,
  ) {}

  async findOneWithOptions(
    options: FindOneOptions<CartItem>,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepo.findOne(options);
  }

  async findManyWithOptions(
    options: FindManyOptions<CartItem>,
  ): Promise<CartItem[]> {
    return await this.cartItemsRepo.find(options);
  }

  async findActiveCartItemsOfUserByCartItemIds(
    userId: string,
    cartItemIds: string[],
  ): Promise<CartItem[]> {
    return await this.cartItemsRepo.find({
      where: {
        userId: userId,
        id: In(cartItemIds),
        cartItemStatus: CartItemStatus.ACTIVE,
        isDeleted: false,
      },
      relations: { product: true },
    });
  }

  async findActiveCartItemByUserIdAndProductId(
    userId: string,
    productId: string,
  ): Promise<CartItem | null> {
    return await this.cartItemsRepo.findOne({
      where: {
        userId: userId,
        productId: productId,
        cartItemStatus: CartItemStatus.ACTIVE,
        isDeleted: false,
      },
      relations: {
        product: true,
        user: true,
      },
    });
  }

  async findActiveCartItemsByUserIdAndProductIds(
    userId: string,
    productIds: string[],
  ): Promise<CartItem[]> {
    return await this.cartItemsRepo.find({
      where: {
        userId: userId,
        productId: In(productIds),
        cartItemStatus: CartItemStatus.ACTIVE,
        isDeleted: false,
      },
      relations: {
        product: true,
        user: true,
      },
    });
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
        product: true,
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
        product: true,
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
      relations: { product: true },
    });
  }

  async createCartItem(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<CartItem> {
    const newCartItem = this.cartItemsRepo.create({
      userId: userId,
      productId: productId,
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

  async markActiveCartItemOfUserAsOrdered(
    userId: string,
    cartItemId: string,
  ): Promise<boolean> {
    const updateResult = await this.cartItemsRepo.update(
      {
        userId: userId,
        id: cartItemId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      { cartItemStatus: CartItemStatus.ORDERED },
    );
    return updateResult.affected !== 0;
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

  async markAllActiveCartItemsOfUserAsOrdered(userId: string): Promise<number> {
    const updateResult = await this.cartItemsRepo.update(
      {
        userId,
        isDeleted: false,
        cartItemStatus: CartItemStatus.ACTIVE,
      },
      { cartItemStatus: CartItemStatus.ORDERED },
    );
    return updateResult.affected ?? 0;
  }
}
