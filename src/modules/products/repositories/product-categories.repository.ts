import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { In, QueryDeepPartialEntity, Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { Category } from '../../categories/entities/category.entity';
import { Transactional } from 'typeorm-transactional';

export class ProductCategoriesRepository {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepository: Repository<ProductCategory>,
  ) {}

  async saveProductCategories(
    product: Product,
    categories: Category[],
  ): Promise<ProductCategory[]> {
    const createdProductCategories = categories.map((category) => {
      return this.productCategoriesRepository.create({
        productId: product.id,
        product: product,
        categoryId: category.id,
        category: category,
      });
    });
    return await this.productCategoriesRepository.save(
      createdProductCategories,
    );
  }

  @Transactional()
  async replaceProductCategories(productId: string, categoryIds: string[]) {
    await this.productCategoriesRepository.update(
      {
        productId: productId,
      },
      { isDeleted: true },
    );
    const values: QueryDeepPartialEntity<ProductCategory>[] = categoryIds.map(
      (id) => ({
        productId: productId,
        categoryId: id,
        isDeleted: false,
      }),
    );

    const upsertResult = this.productCategoriesRepository
      .createQueryBuilder()
      .insert()
      .into(ProductCategory)
      .values(values)
      .orUpdate(['product_id', 'category_id', 'is_deleted'])
      .execute();
    return upsertResult;
  }

  async softDeleteProductCategories(
    productId: string,
    categoryIds: string[],
  ): Promise<number> {
    const deleteResult = await this.productCategoriesRepository.update(
      { productId: productId, categoryId: In(categoryIds), isDeleted: false },
      { isDeleted: true },
    );
    return deleteResult.affected ?? 0;
  }
}
