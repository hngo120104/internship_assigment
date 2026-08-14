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

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users/active')
  @Roles(Role.ADMIN)
  async findManyActiveUsers(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<UserResponseDto[]> {
    return await this.adminService.findActiveUsers(page, limit);
  }

  @Get('shops/active')
  @Roles(Role.ADMIN)
  async findManyActiveShops(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<UserShopResponseDto[]> {
    return await this.adminService.findActiveShops(page, limit);
  }

  @Get('carts')
  @Roles(Role.ADMIN)
  async findActiveUsersCarts(): Promise<UserCartResponseDto[]> {
    return await this.adminService.findActiveUsersCarts();
  }

  @Post('ban/:userId')
  @Roles(Role.ADMIN)
  async banUser(@Param('userId') userId: string): Promise<UserResponseDto> {
    return await this.adminService.banUser(userId);
  }

  @Post('categories')
  @Roles(Role.ADMIN)
  async createNewCategory(
    @Body() categoryCreateDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.adminService.createNewCategory(categoryCreateDto);
  }

  @Patch('categories/:categoryId')
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() categoryUpdateDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.adminService.updateCategory(
      categoryId,
      categoryUpdateDto,
    );
  }
}
