import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from '../entities/product-category.entity';
import { In, QueryDeepPartialEntity, Repository } from 'typeorm';

export class ProductCategoriesRepository {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly productCategoriesRepository: Repository<ProductCategory>,
  ) {}

  async saveProductCategories(
    productId: string,
    categoryIds: string[],
  ): Promise<ProductCategory[]> {
    const createdProductCategories = categoryIds.map((categoryId) => {
      return this.productCategoriesRepository.create({
        productId: productId,
        categoryId: categoryId,
      });
    });
    return await this.productCategoriesRepository.save(
      createdProductCategories,
    );
  }

  async upsertProductCategories(productId: string, categoryIds: string[]) {
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
