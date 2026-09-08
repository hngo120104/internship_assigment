import { InjectRepository } from '@nestjs/typeorm';
import { Shop, ShopStatus } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { ShopCreateRequestDto } from '../dto/shops/request/shop-create.request.dto';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ShopUpdateRequestDto } from '../dto/shops/request/shop-update.request.dto';

@Injectable()
export class ShopsRepository {
  constructor(
    @InjectRepository(Shop) private readonly shopsRepository: Repository<Shop>,
  ) {}

  async findShopIdByUserId(userId: string): Promise<string | null | undefined> {
    return await this.shopsRepository
      .createQueryBuilder('shops')
      .select('shops.id')
      .where('shops.user_id = :userId', { userId: userId })
      .getRawOne();
  }

  async findAllActiveShops(
    page: number,
    size: number,
  ): Promise<[Shop[], number]> {
    return await this.shopsRepository.findAndCount({
      where: { shopStatus: ShopStatus.ACTIVE, isDeleted: false },
      skip: size * (page - 1),
      take: size,
      order: {
        shopName: 'ASC',
      },
    });
  }

  async createShop(
    user: User,
    shopCreateDto: ShopCreateRequestDto,
  ): Promise<Shop> {
    const newShop = this.shopsRepository.create({
      user,
      userId: user.id,
      shopName: shopCreateDto.shopName,
      description: shopCreateDto.description,
      address: shopCreateDto.address,
    });

    return this.shopsRepository.save(newShop);
  }

  findActiveShopByName(shopName: string): Promise<Shop | null> {
    return this.shopsRepository.findOne({
      where: {
        shopName: shopName,
        shopStatus: ShopStatus.ACTIVE,
        isDeleted: false,
      },
      relations: {
        user: true,
      },
    });
  }

  findActiveShopByUserId(userId: string): Promise<Shop | null> {
    return this.shopsRepository.findOne({
      where: {
        userId,
        shopStatus: ShopStatus.ACTIVE,
        isDeleted: false,
      },
      relations: {
        user: true,
      },
    });
  }

  async updateShopDetails(
    userId: string,
    shopUpdateDto: ShopUpdateRequestDto,
  ): Promise<Shop> {
    const updateResult = await this.shopsRepository.update(
      { userId: userId, isDeleted: false },
      shopUpdateDto,
    );
    if (updateResult.affected === 0)
      throw new NotFoundException('You do not have a shop. Create one.');

    return this.shopsRepository.findOneByOrFail({ userId: userId });
  }

  async softDeleteShop(userId: string): Promise<number> {
    const deleteResult = await this.shopsRepository.update(
      { userId: userId, isDeleted: false },
      { isDeleted: true },
    );
    return deleteResult.affected ?? 0;
  }
}
