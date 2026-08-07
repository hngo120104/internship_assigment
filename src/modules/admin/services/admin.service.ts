import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { RolesService } from '../../users/services/role.service';
import { CategoriesService } from '../../category/services/categories.service';
import { CategoryCreateDto } from '../../category/dto/category.create.dto';
import { CategoryResponseDto } from '../../category/dto/category.response.dto';
import { UserResponseDto } from '../../users/dto/users/user.response.dto';
import { CategoryUpdateDto } from '../../category/dto/category.update.dto';
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

  async findActiveUsers(
    page: number,
    limit: number,
  ): Promise<UserResponseDto[]> {
    return await this.usersService.findManyActiveUsers(page, limit);
  }
  async findActiveUsersCarts(): Promise<CartResponseDto[]> {
    return await this.cartsService.findActiveCarts();
  }

  async createNewCategory(
    categoryCreateDto: CategoryCreateDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.createCategory(categoryCreateDto);
  }

  async updateCategory(
    categoryId: string,
    categoryUpdateDto: CategoryUpdateDto,
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
