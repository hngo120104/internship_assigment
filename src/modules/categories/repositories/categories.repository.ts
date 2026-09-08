import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { In, Repository } from 'typeorm';
import { CategoryCreateRequestDto } from '../dto/request/category-create.request.dto';
import { CategoryUpdateRequestDto } from '../dto/request/category-update.request.dto';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async checkCategoryNameExistingMatched(
    categoryIds: string[],
  ): Promise<boolean> {
    const foundCategories = await this.categoriesRepository.count({
      where: { id: In(categoryIds) },
    });
    return foundCategories !== categoryIds.length;
  }

  async checkCategoryNameExisting(name: string): Promise<boolean> {
    return await this.categoriesRepository.existsBy({ name });
  }

  async createCategory(
    categoryCreateDto: CategoryCreateRequestDto,
  ): Promise<Category> {
    const newCategory = this.categoriesRepository.create({
      ...categoryCreateDto,
    });
    return await this.categoriesRepository.save(newCategory);
  }

  async findAllActiveCategories(
    page: number,
    size: number,
  ): Promise<[Category[], number]> {
    const foundActiveCategories = this.categoriesRepository.findAndCount({
      where: { isActive: true },
      relations: { parent: true, children: true },
      skip: (page - 1) * size,
      take: size,
      order: {
        name: 'ASC',
      },
    });

    return foundActiveCategories;
  }

  async findActiveCategoryById(categoryId: string): Promise<Category | null> {
    const foundActiveCategories = await this.categoriesRepository.findOneBy({
      id: categoryId,
      isActive: true,
    });

    return foundActiveCategories;
  }

  async updateCategory(
    categoryId: string,
    categoryUpdateDto: CategoryUpdateRequestDto,
  ): Promise<Category> {
    const updatedResult = await this.categoriesRepository.update(
      categoryId,
      categoryUpdateDto,
    );

    if (updatedResult.affected === 0) {
      throw new NotFoundException('Category does not exists.');
    }

    return this.categoriesRepository.findOneByOrFail({ id: categoryId });
  }
}
