import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategories } from '../entities/product.categories.entity';
import { Repository } from 'typeorm';

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
}
