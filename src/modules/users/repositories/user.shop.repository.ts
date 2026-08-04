import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { UserShopCreateRequestDto } from '../dto/user.shop/user.shop.create.request.dto';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

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
        isDeleted: false,
      },
      relations: {
        user: true,
      },
    });
  }
}
