import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategories } from '../entities/product.categories.entity';
import { In, QueryDeepPartialEntity, Repository } from 'typeorm';

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

  async upsertProductCategories(productId: string, categoryIds: string[]) {
    await this.productCategoriesRepo.update(
      {
        productId: productId,
      },
      { isDeleted: true },
    );
    const values: QueryDeepPartialEntity<ProductCategories>[] = categoryIds.map(
      (id) => ({
        productId: productId,
        categoryId: id,
        isDeleted: false,
      }),
    );
    const upsertResult = this.productCategoriesRepo
      .createQueryBuilder()
      .insert()
      .into(ProductCategories)
      .values(values)
      .orUpdate(['product_id', 'category_id', 'is_deleted'])
      .execute();
    return upsertResult;
  }

  async softDeleteProductCategories(
    productId: string,
    categoryIds: string[],
  ): Promise<number> {
    const deleteResult = await this.productCategoriesRepo.update(
      { productId: productId, categoryId: In(categoryIds), isDeleted: false },
      { isDeleted: true },
    );
    return deleteResult.affected ?? 0;
  }
}
