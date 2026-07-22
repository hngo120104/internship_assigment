import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { UserShopCreateRequestDto } from '../dto/user.shop.create.request.dto';
import { Repository } from 'typeorm';

export class UserShopRepository {
  constructor(
    @InjectRepository(Shop) private readonly userShopRepo: Repository<Shop>,
  ) {}

  async createShop(
    user: User,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<Shop> {
    const newUserShop = this.userShopRepo.create({
      user,
      shopName: userShopCreateRequestDto.shopName,
      description: userShopCreateRequestDto.description,
      address: userShopCreateRequestDto.address,
    });

    return await this.userShopRepo.save(newUserShop);
  }
}
