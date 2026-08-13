import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CategoryResponseDto } from '../../category/dto/response/category.response.dto';
import { CategoryCreateRequestDto } from '../../category/dto/request/category.create.request.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { CategoryUpdateRequestDto } from '../../category/dto/request/category.update.request.dto';
import { UserResponseDto } from '../../users/dto/users/response/user.response.dto';
import { UserCartResponseDto } from '../../carts/dto/response/cart.response.dto';
import { UserShopResponseDto } from '../../users/dto/user.shop/response/user.shop.response.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  @Get('users/active')
  @Roles(Role.ADMIN)
  async findManyActiveUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<UserResponseDto[]> {
    return await this.AdminService.findActiveUsers(page, limit);
  }

  @Get('shops/active')
  @Roles(Role.ADMIN)
  async finfManyActiveShops(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<UserShopResponseDto[]> {
    return await this.AdminService.findActiveShops(page, limit);
  }

  @Get('carts')
  @Roles(Role.ADMIN)
  async findActiveUsersCarts(): Promise<UserCartResponseDto[]> {
    return await this.AdminService.findActiveUsersCarts();
  }

  @Post('ban/:userId')
  @Roles(Role.ADMIN)
  async banUser(@Param('userId') userId: string): Promise<UserResponseDto> {
    return await this.AdminService.banUser(userId);
  }

  @Post('categories')
  @Roles(Role.ADMIN)
  async createNewCategory(
    @Body() categoryCreateDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.AdminService.createNewCategory(categoryCreateDto);
  }

  @Patch('categories/:categoryId')
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() categoryUpdateDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.AdminService.updateCategory(
      categoryId,
      categoryUpdateDto,
    );
  }
}
