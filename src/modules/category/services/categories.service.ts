import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryCreateRequestDto } from '../dto/request/category.create.request.dto';
import { CategoryResponseDto } from '../dto/response/category.response.dto';
import { Category } from '../entities/category.entity';
import { CategoryUpdateRequestDto } from '../dto/request/category.update.request.dto';
import { In } from 'typeorm';
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

  async findActiveCategoryEntitiesByIds(
    categoryIds: string[],
  ): Promise<Category[]> {
    const foundActiveCategoriyEntities =
      await this.categoriesRepo.findActiveCategoryEntitiesByIds(categoryIds);
    return foundActiveCategoriyEntities;
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

  async deleteCategories(
    categoryIds: string[],
  ): Promise<CategoryResponseDto[]> {
    if (categoryIds.length === 0) {
      throw new BadRequestException(
        'Categories to be deleted must not be empty.',
      );
    }
    const deletedCategoriesNumber =
      await this.categoriesRepo.softDeleteCategoriesByIds(categoryIds);
    if (deletedCategoriesNumber != categoryIds.length) {
      throw new NotFoundException('Some categories might already be deleted.');
    }
    const deletedCategories = await this.categoriesRepo.findManyWithOptions({
      where: { id: In(categoryIds), isActive: false },
    });
    return toListResponseDtos(CategoryResponseDto, deletedCategories);
  }
}
