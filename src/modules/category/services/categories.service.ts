import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryCreateRequestDto } from '../dto/request/category.create.request.dto';
import { CategoryResponseDto } from '../dto/response/category.response.dto';
import { CategoryUpdateRequestDto } from '../dto/request/category.update.request.dto';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async createCategoryOrThrow(
    categoryCreateDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    if (categoryCreateDto.parentId) {
      const parentCategory = await this.categoriesRepo.findActiveCategoryById(
        categoryCreateDto.parentId,
      );
      if (!parentCategory) {
        throw new NotFoundException('Parent category not found.');
      }
    }
    const createdCategory =
      await this.categoriesRepo.createCategory(categoryCreateDto);
    return toResponseDto(CategoryResponseDto, createdCategory);
  }

  async findManyActiveCategories(
    page: number,
    limit: number,
  ): Promise<CategoryResponseDto[]> {
    const foundActiveCategories =
      await this.categoriesRepo.findManyActiveCategories(page, limit);
    return toListResponseDtos(CategoryResponseDto, foundActiveCategories);
  }

  async updateCategory(
    categoryId: string,
    categoryUpdateDto: CategoryUpdateRequestDto,
  ): Promise<CategoryResponseDto> {
    const updatedCategory = await this.categoriesRepo.updateCategory(
      categoryId,
      categoryUpdateDto,
    );
    return toResponseDto(CategoryResponseDto, updatedCategory);
  }
}
