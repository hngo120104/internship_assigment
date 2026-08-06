import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategories } from '../entities/product.categories.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';

export class ProductCategoriesRepository {
  constructor(
    @InjectRepository(ProductCategories)
    private readonly productCategoriesRepo: Repository<ProductCategories>,
  ) {}

  async saveProductCategories(
    productId: string,
    categoryIds: string[],
  ): Promise<ProductCategories[]> {
    const createdProductCategories = categoryIds.map((categoryId) => {
      return this.productCategoriesRepo.create({
        productId: productId,
        categoryId: categoryId,
      });
    });

    return await this.productCategoriesRepo.save(createdProductCategories);
  }

  async updateProductCategories(productId: string, categoryIds: string[]) {
    const updatedProductCategories = categoryIds.map((categoryId) => {
      return {
        productId: productId,
        categoryId: categoryId,
      };
    });
    try {
      await this.productCategoriesRepo.upsert(updatedProductCategories, [
        'productId',
        'categoryId',
      ]);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Wrong product or category ids.');
      }
      throw error;
    }
  }
}
