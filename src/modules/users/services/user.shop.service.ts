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
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { plainToInstance } from 'class-transformer';
import { UserRolesRepository } from '../repositories/user.roles.repository';

@Injectable()
export class UserShopService {
  constructor(
    private readonly userShopRepo: UserShopRepository,
    private readonly usersRepo: UsersRepository,
    private readonly roleRepo: RolesRepository,
    private readonly userRolesRepo: UserRolesRepository,
  ) {}

  private async validateShopRegistration(
    userId: string,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<User> {
    const foundUser = await this.usersRepo.findActiveUserById(userId);
    if (!foundUser) {
      throw new NotFoundException(`User with id: ${userId} not found.`);
    }

    if (foundUser.shop) {
      throw new BadRequestException('User is already shop.');
    }

    const existShopName = await this.userShopRepo.findActiveShopByName(
      userShopCreateRequestDto.shopName,
    );
    if (existShopName) {
      throw new ConflictException('Shop name already exists.');
    }
    return foundUser;
  }

  async proccessCreateShop(
    userId: string,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<{ existUser: User; createdShop: Shop }> {
    const foundUser = await this.validateShopRegistration(
      userId,
      userShopCreateRequestDto,
    );

    const sellerRole = await this.roleRepo.findByRoleName('SELLER');
    if (!foundUser.userRoles.some((roles) => roles.role.name === 'SELLER')) {
      const insertedUserRole = await this.userRolesRepo.saveUserRoles(
        foundUser,
        sellerRole,
      );
      foundUser.userRoles.push(insertedUserRole);
    }
    await this.usersRepo.saveUser(foundUser);

    const newShop = await this.userShopRepo.createShop(
      foundUser,
      userShopCreateRequestDto,
    );

    return {
      existUser: foundUser,
      createdShop: newShop,
    };
  }

  @Transactional()
  async createShop(
    userId: string,
    userShopCreateRequestDto: UserShopCreateRequestDto,
  ): Promise<UserShopCreateResponseDto> {
    const { existUser, createdShop } = await this.proccessCreateShop(
      userId,
      userShopCreateRequestDto,
    );

    return this.toUserShopCreateResponseDto(existUser, createdShop);
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
        ...shop,
        user,
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
