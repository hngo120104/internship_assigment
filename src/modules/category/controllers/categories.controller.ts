import { Controller, Get, Post, Injectable, Body } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { Public } from '../../auth/public.decorator';
import { CategoryCreateRequestDto } from '../dto/category.create.request.dto';
import { CategoryResponseDto } from '../dto/category.response.dto';
import { CategoriesService } from '../services/categories.service';

@Injectable()
@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Public()
  async findManyActiveCategories() {
    const foundActiveCategories = await this.categoriesService.findManyActiveCategories(1, 20);
    return foundActiveCategories;
  }

  @Public()
  @Post('new-category')
  async createCategory(@Body() categoryCreateRequestDto: CategoryCreateRequestDto): Promise<CategoryResponseDto> {
    const newCategory = await this.categoriesService.createCategory(categoryCreateRequestDto);
    return newCategory;
  }

}
