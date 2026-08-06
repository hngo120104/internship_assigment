import { InjectRepository } from '@nestjs/typeorm';
import { Shop, ShopStatus } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { UserShopCreateRequestDto } from '../dto/user.shop/user.shop.create.request.dto';
import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { UserShopUpdateDto } from '../dto/user.shop/user.shop.update.dto';

@Injectable()
export class UserShopRepository {
  constructor(
    @InjectRepository(Shop) private readonly userShopRepo: Repository<Shop>,
  ) {}

  async createShop(
    user: User,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<Shop> {
    const newUserShop = this.userShopRepo.create({
      id: randomUUID(),
      user,
      userId: user.id,
      shopName: userShopCreateRequestDto.shopName,
      description: userShopCreateRequestDto.description,
      address: userShopCreateRequestDto.address,
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
    userShopUpdateDto: UserShopUpdateDto,
  ): Promise<Shop> {
    const result = await this.userShopRepo.update(
      { userId: userId },
      userShopUpdateDto,
    );
    if (result.affected === 0)
      throw new NotFoundException('You do not have a shop. Create one.');

    return this.userShopRepo.findOneByOrFail({ userId: userId });
  }
}
