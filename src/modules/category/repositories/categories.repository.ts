import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { In, Repository } from 'typeorm';
import { CategoryCreateDto } from '../dto/category.create.dto';
import { CategoryUpdateDto } from '../dto/category.update.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepo: Repository<Category>,
  ) {}

  async createCategory(
    categoryCreateDto: CategoryCreateDto,
  ): Promise<Category> {
    const newCategory = this.categoriesRepo.create({
      ...categoryCreateDto,
    });
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

  async updateCategory(
    categoryId: string,
    categoryUpdateDto: CategoryUpdateDto,
  ): Promise<Category> {
    const updatedResult = await this.categoriesRepo.update(
      categoryId,
      categoryUpdateDto,
    );

    if (updatedResult.affected === 0) {
      throw new NotFoundException('Category does not exists.');
    }

    return this.categoriesRepo.findOneByOrFail({ id: categoryId });
  }
}
