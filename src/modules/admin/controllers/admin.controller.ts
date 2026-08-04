import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { CategoryResponseDto } from '../../category/dto/category.response.dto';
import { CategoryCreateRequestDto } from '../../category/dto/category.create.request.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { CategoryUpdateRequestDto } from '../../category/dto/category.update.request.dto';
import { UserResponseDto } from '../../users/dto/users/user.response.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly AdminService: AdminService) {}

  @Post('ban/:userId')
  @Roles(Role.ADMIN)
  async banUser(@Param('userId') userId: string): Promise<UserResponseDto> {
    return await this.AdminService.banUser(userId);
  }

  @Post('categories')
  @Roles(Role.ADMIN)
  async createNewCategory(
    @Body() categoryCreateRequestDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.AdminService.createNewCategory(categoryCreateRequestDto);
  }

  @Patch('categories/:categoryId')
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() categoryUpdateRequestDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.AdminService.updateCategory(
      categoryId,
      categoryUpdateRequestDto,
    );
  }
}
