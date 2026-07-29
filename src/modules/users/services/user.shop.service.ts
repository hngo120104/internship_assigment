import { UserShopCreateRequestDto } from '../dto/user.shop/user.shop.create.request.dto';
import { UserShopCreateResponseDto } from '../dto/user.shop/user.shop.create.response.dto';
import { UserShopResponseDto } from '../dto/user.shop/user.shop.response.dto';
import { Shop } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { RolesRepository } from '../repositories/role.repository';
import { UserShopRepository } from '../repositories/user.shop.repository';
import { UsersRepository } from '../repositories/users.repository';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserShopService {
  constructor(
    private readonly userShopRepo: UserShopRepository,
    private readonly usersRepo: UsersRepository,
    private readonly roleRepo: RolesRepository,
  ) {}

  private async validateShopRegistration(userId: string): Promise<User> {
    const foundUser = await this.usersRepo.findActiveUserById(userId);
    if (!foundUser) {
      throw new NotFoundException(`User with id: ${userId} not found.`);
    }

    if (foundUser.shop) {
      throw new BadRequestException('User is already shop.');
    }
    return foundUser;
  }

  @Transactional()
  async createShop(
    userId: string,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<UserShopCreateResponseDto> {
    const foundUser = await this.validateShopRegistration(userId);

    // first assign found user role with 'SELLER'
    const sellerRole = await this.roleRepo.findByRoleName('SELLER');
    if (!foundUser.roles.some((role) => role.name === 'SELLER')) {
      foundUser.roles.push(sellerRole);
    }
    await this.usersRepo.saveUser(foundUser);

    const newShop = await this.userShopRepo.createShop(
      foundUser,
      userShopCreateRequestDto,
    );

    return this.toUserShopCreateResponseDto(foundUser, newShop);
  }

  async findShopByUserId(userId: string): Promise<UserShopResponseDto> {
    const foundShop = await this.userShopRepo.findActiveShopByUserId(userId);

    if (!foundShop) {
      throw new NotFoundException('User does not have shop');
    }

    return this.toUserShopResponseDto(foundShop);
  }

  // async findManyActiveShops(pagination: number): Promise<UserShopResponseDto> {
  //   const foundActiveShops = await this.userShopRepo.findManyActiveShops(pagination);
  //   return to
  // }

  private toUserShopCreateResponseDto(
    user: User,
    shop: Shop,
  ): UserShopCreateResponseDto {
    return plainToInstance(
      UserShopCreateResponseDto,
      {
        ...user,
        ...shop,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private toUserShopResponseDto(shop: Shop): UserShopResponseDto {
    return plainToInstance(UserShopResponseDto, shop, {
      excludeExtraneousValues: true,
    });
  }
}
