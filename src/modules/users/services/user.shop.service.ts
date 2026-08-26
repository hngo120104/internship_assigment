import { UserShopCreateRequestDto } from '../dto/user.shop/request/user.shop.create.request.dto';
import { UserShopResponseDto } from '../dto/user.shop/response/user.shop.response.dto';
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
import { UserRolesRepository } from '../repositories/user.roles.repository';
import { UserShopUpdateRequestDto } from '../dto/user.shop/request/user.shop.update.request.dto';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';

@Injectable()
export class UserShopService {
  constructor(
    private readonly userShopRepo: UserShopRepository,
    private readonly usersRepo: UsersRepository,
    private readonly roleRepo: RolesRepository,
    private readonly userRolesRepo: UserRolesRepository,
  ) {}

  async findShopIdByUserIdOrThrowByUserIdOrThrow(
    userId: string,
  ): Promise<string> {
    const foundShopId =
      await this.userShopRepo.findShopIdByUserIdByUserId(userId);
    if (!foundShopId) {
      throw new NotFoundException('Shop not found.');
    }
    return foundShopId;
  }

  private async validateShopRegistration(
    userId: string,
    userShopCreateDto: UserShopCreateRequestDto,
  ): Promise<User> {
    const foundUser = await this.usersRepo.findActiveUserById(userId);
    if (!foundUser) {
      throw new NotFoundException(`User with id: ${userId} not found.`);
    }

    if (foundUser.shop) {
      throw new BadRequestException('User is already shop.');
    }

    const existingShopName = await this.userShopRepo.findActiveShopByName(
      userShopCreateDto.shopName,
    );
    if (existingShopName) {
      throw new ConflictException('Shop name already exists.');
    }
    return foundUser;
  }

  async processCreateShop(
    userId: string,
    userShopCreateDto: UserShopCreateRequestDto,
  ): Promise<Shop> {
    const foundUser = await this.validateShopRegistration(
      userId,
      userShopCreateDto,
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
      userShopCreateDto,
    );

    return newShop;
  }

  @Transactional()
  async createShop(
    userId: string,
    userShopCreateDto: UserShopCreateRequestDto,
  ): Promise<UserShopResponseDto> {
    const createdShop = await this.processCreateShop(userId, userShopCreateDto);

    return toResponseDto(UserShopResponseDto, createdShop);
  }

  async findShopByUserIdOrThrow(userId: string): Promise<UserShopResponseDto> {
    const foundShop = await this.userShopRepo.findActiveShopByUserId(userId);

    if (!foundShop) {
      throw new NotFoundException('User does not have shop');
    }

    return toResponseDto(UserShopResponseDto, foundShop);
  }

  async findShopEntityByUserIdOrThrow(userId: string): Promise<Shop> {
    const foundShop = await this.userShopRepo.findActiveShopByUserId(userId);

    if (!foundShop) {
      throw new NotFoundException('User does not have shop');
    }

    return foundShop;
  }

  async findAllActiveShops(
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<UserShopResponseDto>> {
    const [foundActiveShops, count] =
      await this.userShopRepo.findAllActiveShops(
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(UserShopResponseDto, foundActiveShops);
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
  }

  async updateShopDetails(
    userId: string,
    userShopUpdateDto: UserShopUpdateRequestDto,
  ): Promise<UserShopResponseDto> {
    const updatedShop = await this.userShopRepo.updateShopDetails(
      userId,
      userShopUpdateDto,
    );
    return toResponseDto(UserShopResponseDto, updatedShop);
  }

  async deleteShopOrThrow(userId: string): Promise<number> {
    const deletedCount = await this.userShopRepo.softDeleteShop(userId);
    if (deletedCount !== 1) {
      throw new NotFoundException('User does not have a shop.');
    }
    return deletedCount;
  }
}
