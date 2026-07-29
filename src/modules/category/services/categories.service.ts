import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriesRepository } from '../repositories/categories.repository';
import { CategoryCreateRequestDto } from '../dto/category.create.request.dto';
import { CategoryResponseDto } from '../dto/category.response.dto';
import { Category } from '../entities/category.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepo: CategoriesRepository) {}

  async createCategory(
    categoryCreateRequestDto: CategoryCreateRequestDto,
  ): Promise<CategoryResponseDto> {
    const createdCategory = await this.categoriesRepo.createCategory(
      categoryCreateRequestDto,
    );
    return this.toCategoryResponseDto(createdCategory);
  }

  async findActiveCategoryEntitiesByIds(categoryIds: string[]): Promise<Category[]> {
    const foundActiveCategoriyEntities = await this.categoriesRepo.findActiveCategoryEntitiesByIds(categoryIds);
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
