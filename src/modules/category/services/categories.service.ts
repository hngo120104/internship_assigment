import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryCreateDto } from '../dto/category.create.dto';
import { CategoryResponseDto } from '../dto/category.response.dto';
import { Category } from '../entities/category.entity';
import { plainToInstance } from 'class-transformer';
import { CategoryUpdateDto } from '../dto/category.update.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async createCategory(
    categoryCreateDto: CategoryCreateDto,
  ): Promise<CategoryResponseDto> {
    const createdCategory =
      await this.categoriesRepo.createCategory(categoryCreateDto);
    return this.toCategoryResponseDto(createdCategory);
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
    return this.toCategoriesArrayResponseDto(foundActiveCategories);
  }

  async updateCategory(
    categoryId: string,
    categoryUpdateDto: CategoryUpdateDto,
  ): Promise<CategoryResponseDto> {
    const updatedCategory = await this.categoriesRepo.updateCategory(
      categoryId,
      categoryUpdateDto,
    );
    return this.toCategoryResponseDto(updatedCategory);
  }

  toCategoryResponseDto(category: Category): CategoryResponseDto {
    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }

  toCategoriesArrayResponseDto(category: Category[]): CategoryResponseDto[] {
    return plainToInstance(CategoryResponseDto, category, {
      excludeExtraneousValues: true,
    });
  }
}
