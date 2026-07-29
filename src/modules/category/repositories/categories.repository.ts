import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { In, Repository } from 'typeorm';
import { CategoryCreateRequestDto } from '../dto/category.create.request.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async createCategory(
    categoryCreateRequestDto: CategoryCreateRequestDto,
  ): Promise<Category> {
    const newCategory = this.categoriesRepo.create(categoryCreateRequestDto);
    return await this.categoriesRepo.save(newCategory);
  }

  async findActiveCategoryEntitiesByIds(
    categoryIds: string[],
  ): Promise<Category[]> {
    const foundCategories = await this.categoriesRepo.find({
      where: { id: In(categoryIds), isActive: true },
    });
    return foundCategories;
  }

  async findManyActiveCategories(
    page: number,
    limit: number,
  ): Promise<Category[]> {
    const foundActiveCategories = this.categoriesRepo.find({
      where: { isActive: true },
      relations: { parent: true, children: true },
      skip: (page - 1) * limit,
      take: limit,
    });

    return foundActiveCategories;
  }

  async findActiveCategoryById(categoryId: string): Promise<Category | null> {
    const foundActiveCategories = await this.categoriesRepo.findOneBy({
      id: categoryId,
    });

    return foundActiveCategories;
  }
}
