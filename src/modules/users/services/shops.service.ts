import { ShopCreateRequestDto } from '../dto/shops/request/shop-create.request.dto';
import { ShopResponseDto } from '../dto/shops/response/shop.response.dto';
import { Shop } from '../entities/shop.entity';
import { User } from '../entities/user.entity';
import { RolesRepository } from '../repositories/roles.repository';
import { ShopsRepository } from '../repositories/shops.repository';
import { UsersRepository } from '../repositories/users.repository';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from 'typeorm-transactional';
import { UserRolesRepository } from '../repositories/user-roles.repository';
import { ShopUpdateRequestDto } from '../dto/shops/request/shop-update.request.dto';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/response-dto.mapper';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Injectable()
export class ShopsService {
  constructor(
    private readonly shopsRepository: ShopsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly userRolesRepository: UserRolesRepository,
  ) {}

  async findShopIdByUserIdOrThrow(userId: string): Promise<string> {
    const foundShopId = await this.shopsRepository.findShopIdByUserId(userId);
    if (!foundShopId) {
      throw new NotFoundException('Shop not found.');
    }
    return foundShopId;
  }

  private async validateShopRegistration(
    userId: string,
    shopCreateDto: ShopCreateRequestDto,
  ): Promise<User> {
    const foundUser = await this.usersRepository.findActiveUserById(userId);
    if (!foundUser) {
      throw new NotFoundException(`User with id: ${userId} not found.`);
    }

    if (foundUser.shop) {
      throw new BadRequestException('User is already shop.');
    }

    const existingShopName = await this.shopsRepository.findActiveShopByName(
      shopCreateDto.shopName,
    );
    if (existingShopName) {
      throw new ConflictException('Shop name already exists.');
    }
    return foundUser;
  }

  async processCreateShop(
    userId: string,
    shopCreateDto: ShopCreateRequestDto,
  ): Promise<Shop> {
    const foundUser = await this.validateShopRegistration(
      userId,
      shopCreateDto,
    );

    const sellerRole = await this.rolesRepository.findByRoleName('SELLER');
    if (!foundUser.userRoles.some((roles) => roles.role.name === 'SELLER')) {
      const insertedUserRole = await this.userRolesRepository.saveUserRole(
        foundUser,
        sellerRole,
      );
      foundUser.userRoles.push(insertedUserRole);
    }
    await this.usersRepository.saveUser(foundUser);

    const newShop = await this.shopsRepository.createShop(
      foundUser,
      shopCreateDto,
    );

    return newShop;
  }

  @Transactional()
  async createShop(
    userId: string,
    shopCreateDto: ShopCreateRequestDto,
  ): Promise<ShopResponseDto> {
    const createdShop = await this.processCreateShop(userId, shopCreateDto);

    return toResponseDto(ShopResponseDto, createdShop);
  }

  async findShopByUserIdOrThrow(userId: string): Promise<ShopResponseDto> {
    const foundShop = await this.shopsRepository.findActiveShopByUserId(userId);

    if (!foundShop) {
      throw new NotFoundException('User account is not a seller');
    }

    return toResponseDto(ShopResponseDto, foundShop);
  }

  async findShopEntityByUserIdOrThrow(userId: string): Promise<Shop> {
    const foundShop = await this.shopsRepository.findActiveShopByUserId(userId);

    if (!foundShop) {
      throw new NotFoundException('User account is not a seller');
    }

    return foundShop;
  }

  async findAllActiveShops(
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ShopResponseDto>> {
    const [foundActiveShops, count] =
      await this.shopsRepository.findAllActiveShops(
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(ShopResponseDto, foundActiveShops);
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
  }

  async updateShopDetails(
    userId: string,
    shopUpdateDto: ShopUpdateRequestDto,
  ): Promise<ShopResponseDto> {
    const updatedShop = await this.shopsRepository.updateShopDetails(
      userId,
      shopUpdateDto,
    );
    return toResponseDto(ShopResponseDto, updatedShop);
  }

  async deleteShopOrThrow(userId: string): Promise<number> {
    const deletedCount = await this.shopsRepository.softDeleteShop(userId);
    if (deletedCount !== 1) {
      throw new NotFoundException('User does not have a shop.');
    }
    return deletedCount;
  }
}
