import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { CategoriesService } from '../../category/services/categories.service';
import { CategoryCreateRequestDto } from '../../category/dto/request/category.create.request.dto';
import { CategoryResponseDto } from '../../category/dto/response/category.response.dto';
import { UserResponseDto } from '../../users/dto/users/response/user.response.dto';
import { CategoryUpdateRequestDto } from '../../category/dto/request/category.update.request.dto';
import { UserCartResponseDto } from '../../carts/dto/response/cart.response.dto';
import { CartItemsService } from '../../carts/services/cart.items.service';
import { UserShopResponseDto } from '../../users/dto/user.shop/response/user.shop.response.dto';
import { UserShopService } from '../../users/services/user.shop.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly userShopService: UserShopService,
    private readonly categoriesService: CategoriesService,
    private readonly cartItemsService: CartItemsService,
  ) {}

  async findActiveUsers(
    page: number,
    limit: number,
  ): Promise<UserResponseDto[]> {
    return await this.usersService.findManyActiveUsers(page, limit);
  }

  async findActiveUsersCarts(
    page: number,
    limit: number,
  ): Promise<UserCartResponseDto[]> {
    return await this.cartItemsService.findAllActiveUserCarts(page, limit);
  }

  async findActiveShops(
    page: number,
    limit: number,
  ): Promise<UserShopResponseDto[]> {
    return await this.userShopService.findManyActiveShops(page, limit);
  }

  async createNewCategory(
    categoryCreateDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.createCategoryOrThrow(
      categoryCreateDto,
    );
  }

  async updateCategory(
    categoryId: string,
    categoryUpdateDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.updateCategory(
      categoryId,
      categoryUpdateDto,
    );
  }

  async banUser(userId: string): Promise<UserResponseDto> {
    return await this.usersService.banUser(userId);
  }
}
