import { InjectRepository } from '@nestjs/typeorm';
import { Shop, ShopStatus } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { UserShopCreateDto } from '../dto/user.shop/user.shop.create.dto';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserShopUpdateDto } from '../dto/user.shop/user.shop.update.dto';

@Injectable()
export class UserShopRepository {
  constructor(
    @InjectRepository(Shop) private readonly userShopRepo: Repository<Shop>,
  ) {}

  async findOneWithOptions(
    options: FindOneOptions<Shop>,
  ): Promise<Shop | null> {
    return await this.userShopRepo.findOne(options);
  }

  async findManyWithOptions(options: FindManyOptions<Shop>): Promise<Shop[]> {
    return await this.userShopRepo.find(options);
  }

  async createShop(
    user: User,
    userShopCreateDto: UserShopCreateDto,
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
    userShopUpdateDto: UserShopUpdateDto,
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
