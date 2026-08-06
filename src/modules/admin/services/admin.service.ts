import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { RolesService } from '../../users/services/role.service';
import { CategoriesService } from '../../category/services/categories.service';
import { CategoryCreateRequestDto } from '../../category/dto/category.create.request.dto';
import { CategoryResponseDto } from '../../category/dto/category.response.dto';
import { UserResponseDto } from '../../users/dto/users/user.response.dto';
import { CategoryUpdateRequestDto } from '../../category/dto/category.update.request.dto';
import { CartResponseDto } from '../../carts/dto/cart.response.dto';
import { CartsService } from '../../carts/services/carts.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly categoriesService: CategoriesService,
    private readonly cartsService: CartsService,
  ) {}

  async findActiveUsersCarts(): Promise<CartResponseDto[]> {
    return await this.cartsService.findActiveCarts();
  }

  async createNewCategory(
    categoryCreateRequestDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.createCategory(
      categoryCreateRequestDto,
    );
  }

  async updateCategory(
    categoryId: string,
    categoryUpdateRequestDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.updateCategory(
      categoryId,
      categoryUpdateRequestDto,
    );
  }

  async banUser(userId: string): Promise<UserResponseDto> {
    return await this.usersService.banUser(userId);
  }
}
