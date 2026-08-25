import { InjectRepository } from '@nestjs/typeorm';
import { Shop, ShopStatus } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { UserShopCreateRequestDto } from '../dto/user.shop/request/user.shop.create.request.dto';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserShopUpdateRequestDto } from '../dto/user.shop/request/user.shop.update.request.dto';

@Injectable()
export class UserShopRepository {
  constructor(
    @InjectRepository(Shop) private readonly userShopRepo: Repository<Shop>,
  ) {}

  async findShopIdByUserIdByUserId(
    userId: string,
  ): Promise<string | null | undefined> {
    return await this.userShopRepo
      .createQueryBuilder('shops')
      .select('shops.id')
      .where('shops.user_id = :userId', { userId: userId })
      .getRawOne();
  }

  async findManyActiveShops(
    page: number,
    size: number,
  ): Promise<[Shop[], number]> {
    return await this.userShopRepo.findAndCount({
      where: { shopStatus: ShopStatus.ACTIVE, isDeleted: false },
      skip: size * (page - 1),
      take: size,
    });
  }

  async createShop(
    user: User,
    userShopCreateDto: UserShopCreateRequestDto,
  ): Promise<Shop> {
    const newUserShop = this.userShopRepo.create({
      user,
      userId: user.id,
      shopName: userShopCreateDto.shopName,
      description: userShopCreateDto.description,
      address: userShopCreateDto.address,
    });

    return this.userShopRepo.save(newUserShop);
  }

  findActiveShopByName(shopName: string): Promise<Shop | null> {
    return this.userShopRepo.findOne({
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
    return this.userShopRepo.findOne({
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
    userShopUpdateDto: UserShopUpdateRequestDto,
  ): Promise<Shop> {
    const updateResult = await this.userShopRepo.update(
      { userId: userId, isDeleted: false },
      userShopUpdateDto,
    );
    if (updateResult.affected === 0)
      throw new NotFoundException('You do not have a shop. Create one.');

    return this.userShopRepo.findOneByOrFail({ userId: userId });
  }

  async softDeleteShop(userId: string): Promise<number> {
    const deleteResult = await this.userShopRepo.update(
      { userId: userId, isDeleted: false },
      { isDeleted: true },
    );
    return deleteResult.affected ?? 0;
  }
}
