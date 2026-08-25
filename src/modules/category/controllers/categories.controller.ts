import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { CategoriesService } from '../services/categories.service';
import { CategoryResponseDto } from '../dto/response/category.response.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { CategoryCreateRequestDto } from '../dto/request/category.create.request.dto';
import { CategoryUpdateRequestDto } from '../dto/request/category.update.request.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  async findManyActiveCategories(
    @Query() paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<CategoryResponseDto>> {
    return await this.categoriesService.findManyActiveCategories(
      paginationRequest,
    );
  }

  @Post()
  @Roles(Role.ADMIN)
  async createNewCategory(
    @Body() categoryCreateDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.createCategoryOrThrow(
      categoryCreateDto,
    );
  }

  @Patch(':categoryId')
  @Roles(Role.ADMIN)
  async updateCategory(
    @Param('categoryId') categoryId: string,
    @Body() categoryUpdateDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.updateCategory(
      categoryId,
      categoryUpdateDto,
    );
  }
}
