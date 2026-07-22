import { Role } from '../../auth/guards/role/role.enum';
import { UserShopCreateRequestDto } from '../dto/user.shop.create.request.dto';
import { Shop } from '../entities/shop.entity';
import { UserShopRepository } from '../repositories/user.shop.repository';
import { UsersRepository } from '../repositories/users.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserShopService {
  constructor(
    private readonly userShopRepo: UserShopRepository,
    private readonly usersRepo: UsersRepository,
  ) {}

  @Transactional()
  async createShop(
    userId: number,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<Shop> {
    const foundUser = await this.usersRepo.findById(userId);
    if (!foundUser) {
      throw new NotFoundException(`User with id: ${userId} not found.`);
    }

    if (foundUser.shop) {
      throw new BadRequestException('User is already shop.');
    }

    foundUser.role = Role.SHOP;
    await this.usersRepo.save(foundUser);

    const newShop = await this.userShopRepo.createShop(
      foundUser,
      userShopCreateRequestDto,
    );
    return newShop;
  }
}
