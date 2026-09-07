import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateRequestDto } from '../dto/products/request/product.create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product.update.request.dto';
import { Injectable } from '@nestjs/common';
import { ProductVariant } from '../entities/product.variant.entity';
import { ProductSearchSort } from '../../search/dto/request/products.search.request';
import { ProductRaw } from '../../../common/interfaces/products.search.response.interface';
import { ProductCategories } from '../entities/product.categories.entity';
import { ProductPhoto } from '../entities/product.photo.entity';
import { SelectQueryBuilder } from 'typeorm';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  private createProductsSearchQueryBuilder(
    alias: string,
  ): SelectQueryBuilder<Product> {
    const qb = this.productsRepo.createQueryBuilder(alias);
    qb.innerJoin(
      (subQ) =>
        subQ
          .select('v.productId', 'productId')
          .addSelect('MIN(v.price)', 'minPrice')
          .from(ProductVariant, 'v')
          .where('v.isActive = 1')
          .andWhere('v.isDeleted = 0')
          .groupBy('v.productId'),
      'pv',
      `pv.productId = ${alias}.id`,
    );

    return qb;
  }

  private applyProductsSearchFilters(
    query: SelectQueryBuilder<Product>,
    alias: string,
    formattedKeyword?: string,
    minPrice?: number,
    maxPrice?: number,
    categoryIds?: string[],
    orderBy?: ProductSearchSort,
  ): SelectQueryBuilder<Product> {
    if (formattedKeyword) {
      query.andWhere(
        `MATCH (${alias}.search_document) AGAINST (:keyword IN BOOLEAN MODE)`,
        { keyword: formattedKeyword },
      );
    }
    if (minPrice !== undefined) {
      query.andWhere(`pv.minPrice >= :minPrice`, { minPrice: minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere(`pv.minPrice <= :maxPrice`, { maxPrice: maxPrice });
    }

    if (categoryIds && categoryIds.length > 0) {
      query.andWhere(
        (subQuery) => {
          const sq = subQuery
            .subQuery()
            .select('1')
            .from(ProductCategories, 'pc')
            .where(`pc.productId = ${alias}.id`)
            .andWhere('pc.isDeleted = :pcIsDeleted')
            .andWhere('pc.categoryId IN (:...categoryIds)')
            .getQuery();
          return `EXISTS ${sq}`;
        },
        { pcIsDeleted: false, categoryIds: categoryIds },
      );
    }
    switch (orderBy) {
      case ProductSearchSort.RELEVANCY:
        if (formattedKeyword) query.orderBy('relevancy', 'DESC');
        else query.orderBy('p.createdAt', 'DESC');
        break;
      case ProductSearchSort.NEWEST:
        query.orderBy('p.createdAt', 'DESC');
        break;
      case ProductSearchSort.PRICEASC:
        query.orderBy('pv.minPrice', 'ASC');
        break;
      case ProductSearchSort.PRICEDESC:
        query.orderBy('pv.minPrice', 'DESC');
        break;
      default:
        if (formattedKeyword) query.orderBy('relevancy', 'DESC');
        else query.orderBy('p.createdAt', 'DESC');
        break;
    }
    return query;
  }

  private populateProductPrimaryPhoto(
    query: SelectQueryBuilder<Product>,
  ): SelectQueryBuilder<Product> {
    return query.leftJoin(
      (subQ) =>
        subQ
          .select('pp.url AS thumbnail')
          .from(ProductPhoto, 'pp')
          .where('pp.isPrimary = :ppIsPrimary')
          .andWhere('pp.isDeleted = :ppIsDeleted')
          .limit(1)
          .orderBy('pp.createdAt', 'DESC')
          .addOrderBy('pp.id', 'ASC'),
      'pph',
      'pph.productId = :p.id',
      { ppIsPrimary: true, ppIsDeleted: false },
    );
  }

  async findActiveProductsWithOptionalQueryParams(
    page: number,
    size: number,
    formattedKeyword?: string,
    minPrice?: number,
    maxPrice?: number,
    categoryIds?: string[],
    orderBy?: ProductSearchSort,
  ): Promise<[ProductRaw[], number]> {
    const productQb = this.createProductsSearchQueryBuilder('p');
    this.applyProductsSearchFilters(
      productQb,
      'p',
      formattedKeyword,
      minPrice,
      maxPrice,
      categoryIds,
      orderBy,
    );
    productQb.andWhere(
      'p.isActive = :pIsActive AND p.isDeleted = :pIsDeleted',
      { pIsActive: true, pIsDeleted: false },
    );
    const countQb = productQb.clone();

    const dataQb = productQb.select([
      'p.id AS productId',
      'p.name AS productName',
      'pph.thumbnail AS thumbnail',
      'pv.minPrice AS minPrice',
    ]);

    if (formattedKeyword) {
      dataQb.addSelect(
        `MATCH (p.search_document) AGAINST (:keyword IN BOOLEAN MODE)`,
        'relevancy',
      );
    }

    dataQb.addOrderBy('p.id', 'ASC');
    this.populateProductPrimaryPhoto(dataQb);
    dataQb.limit(size).offset((page - 1) * size);

    countQb.select('COUNT(DISTINCT p.id)', 'count');

    const [items, count] = await Promise.all([
      dataQb.getRawMany<ProductRaw>(),
      countQb.getRawOne<{ count: string }>(),
    ]);
    return [items, Number(count?.count ?? 0)];
  }

  async findProductByIdAndShopId(
    productId: string,
    shopId: string,
  ): Promise<Product | null> {
    return this.productsRepo.findOne({
      where: {
        id: productId,
        shopId: shopId,
        isDeleted: false,
      },
    });
  }

  async findAllUserShopProductsByShopId(
    shopId: string,
    page: number,
    size: number,
  ): Promise<[ProductRaw[], number]> {
    const productQb = this.createProductsSearchQueryBuilder('p');
    productQb
      .addSelect('p.shopId AS shopId')
      .andWhere('shopId = :shopId', { shopId: shopId })
      .orderBy('p.createdAt', 'DESC')
      .addOrderBy('p.id', 'ASC');

    const countQb = productQb.clone().select('COUNT(DISTINCT p.id) AS count');

    this.populateProductPrimaryPhoto(productQb);
    productQb.limit(size).offset((page - 1) * size);
    const [items, count] = await Promise.all([
      productQb.getRawMany<ProductRaw>(),
      countQb.getRawOne<{ count: string }>(),
    ]);
    return [items, Number(count?.count ?? 0)];
  }

  async findActiveProductByVariantId(
    variantId: string,
  ): Promise<Product | null> {
    return this.productsRepo.findOne({
      where: { variants: { id: variantId }, isActive: true, isDeleted: false },
    });
  }

  async createProductOrThrow(
    shopId: string,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const product = this.productsRepo.create({
      shop: { id: shopId },
      name: productCreateDto.name,
      description: productCreateDto.description,
      isActive: productCreateDto.isActive,
    });
    return this.productsRepo.save(product);
  }

  async findAllNewestActiveProducts(
    page: number,
    size: number,
  ): Promise<[ProductRaw[], number]> {
    const productQb = this.createProductsSearchQueryBuilder('p');
    productQb.andWhere(
      'p.isActive = :pIsActive AND p.isDeleted = :pIsDeleted',
      { pIsActive: true, pIsDeleted: false },
    );

    const countQb = productQb.clone().select('COUNT(DISTINCT p.id) AS count');

    productQb.limit(size).offset((page - 1) * size);
    const [items, count] = await Promise.all([
      productQb.getRawMany<ProductRaw>(),
      countQb.getRawOne<{ count: string }>(),
    ]);
    return [items, Number(count?.count ?? 0)];
  }

  async findNewestActiveShopProducts(
    shopId: string,
    page: number,
    size: number,
  ): Promise<[Product[], number]> {}

  async findActiveProductById(productId: string): Promise<Product | null> {
    const foundProduct = await this.productsRepo.findOne({
      where: {
        id: productId,
        isActive: true,
        isDeleted: false,
        productCategories: {
          isDeleted: false,
        },
      },
      relations: {
        shop: true,
        photos: true,
        variants: {
          photo: true,
        },
        productCategories: {
          category: true,
        },
      },
    });
    return foundProduct;
  }

  async updateShopProductById(
    productId: string,
    shopId: string,
    productUpdateDto: ProductUpdateRequestDto,
  ): Promise<boolean> {
    const updateResult = await this.productsRepo.update(
      { id: productId, shopId, isDeleted: false },
      productUpdateDto,
    );
    return updateResult.affected === 1;
  }

  async softDeleteShopProductById(
    productId: string,
    shopId: string,
  ): Promise<number> {
    const deletedProduct = await this.productsRepo.update(
      { shopId: shopId, id: productId, isDeleted: false },
      { isDeleted: true },
    );
    return deletedProduct.affected ?? 0;
  }
}
