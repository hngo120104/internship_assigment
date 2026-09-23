import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateRequestDto } from '../dto/products/request/product-create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product-update.request.dto';
import { Injectable } from '@nestjs/common';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductSearchSort } from '../enums/product-search-sort.enum';
import { ProductRaw } from '../interfaces/product-raw.interface';
import { ProductCategory } from '../entities/product-category.entity';
import { ProductPhoto } from '../entities/product-photo.entity';
import { SelectQueryBuilder } from 'typeorm';
import {
  ProductSearchOptions,
  ProductSearchTerms,
} from '../interfaces/product-search-options.interface';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  private createProductSearchQueryBuilderWithMinPrice(): SelectQueryBuilder<Product> {
    const queryBuilder = this.productsRepository.createQueryBuilder('p');
    queryBuilder.innerJoin(
      (subQ) =>
        subQ
          .select('v.productId', 'productId')
          .addSelect('MIN(v.price)', 'minPrice')
          .from(ProductVariant, 'v')
          .where('v.isActive = 1')
          .andWhere('v.isDeleted = 0')
          .groupBy('v.productId'),
      'pv',
      'pv.productId = p.id',
    );

    return queryBuilder;
  }

  private applyProductSearchFilters(
    query: SelectQueryBuilder<Product>,
    productSearchOptions: ProductSearchOptions,
  ): SelectQueryBuilder<Product> {
    if (productSearchOptions.searchTerms) {
      query.andWhere(
        'MATCH (p.search_document) AGAINST (:booleanKeyword IN BOOLEAN MODE)',
        {
          booleanKeyword:
            productSearchOptions.searchTerms.relaxedBooleanKeyword,
        },
      );
    }
    if (productSearchOptions.minPrice !== undefined) {
      query.andWhere(`pv.minPrice >= :minPrice`, {
        minPrice: productSearchOptions.minPrice,
      });
    }

    if (productSearchOptions.maxPrice !== undefined) {
      query.andWhere(`pv.minPrice <= :maxPrice`, {
        maxPrice: productSearchOptions.maxPrice,
      });
    }

    if (
      productSearchOptions.categoryIds &&
      productSearchOptions.categoryIds.length > 0
    ) {
      query.andWhere(
        (subQuery) => {
          const sq = subQuery
            .subQuery()
            .select('1')
            .from(ProductCategory, 'pc')
            .where('pc.productId = p.id')
            .andWhere('pc.isDeleted = :pcIsDeleted')
            .andWhere('pc.categoryId IN (:...categoryIds)')
            .getQuery();
          return `EXISTS ${sq}`;
        },
        { pcIsDeleted: false, categoryIds: productSearchOptions.categoryIds },
      );
    }

    return query;
  }

  private applyProductSearchSorting(
    query: SelectQueryBuilder<Product>,
    productSearchOptions: ProductSearchOptions,
  ): void {
    switch (productSearchOptions.orderBy) {
      case ProductSearchSort.RELEVANCY:
        if (productSearchOptions.searchTerms) this.sortByRelevancy(query);
        else query.orderBy('p.createdAt', 'DESC');
        break;
      case ProductSearchSort.NEWEST:
        query.orderBy('p.createdAt', 'DESC');
        break;
      case ProductSearchSort.PRICE_ASC:
        query.orderBy('pv.minPrice', 'ASC');
        break;
      case ProductSearchSort.PRICE_DESC:
        query.orderBy('pv.minPrice', 'DESC');
        break;
      default:
        if (productSearchOptions.searchTerms) this.sortByRelevancy(query);
        else query.orderBy('p.createdAt', 'DESC');
        break;
    }
    query.addOrderBy('p.id', 'ASC');
  }

  private populateProductPrimaryPhoto(
    query: SelectQueryBuilder<Product>,
  ): SelectQueryBuilder<Product> {
    return query.leftJoin(
      (subQ) =>
        subQ
          .select(['pp.url AS thumbnail', 'pp.productId AS productId'])
          .addSelect(
            'ROW_NUMBER() OVER (PARTITION BY pp.productId ORDER BY pp.id ASC)',
            'rn',
          )
          .from(ProductPhoto, 'pp')
          .where('pp.isPrimary = :ppIsPrimary', { ppIsPrimary: true })
          .andWhere('pp.isDeleted = :ppIsDeleted', { ppIsDeleted: false }),
      'pph',
      'pph.productId = p.id AND pph.rn = 1',
    );
  }

  private addSelectCalculatedRelevancy(
    query: SelectQueryBuilder<Product>,
    searchTerms: ProductSearchTerms,
  ): void {
    query
      .addSelect(
        `CASE WHEN p.name = :rawKeyword THEN 1 ELSE 0 END`,
        'exactName',
      )
      .addSelect(
        `CASE WHEN p.name LIKE CONCAT(:rawKeyword, '%') THEN 1 ELSE 0 END`,
        'prefixMatch',
      )
      .addSelect(
        `
        CASE WHEN :phraseKeyword <> '' AND MATCH(p.search_document) 
        AGAINST(:phraseKeyword IN BOOLEAN MODE) > 0
          THEN 1
          ELSE 0
        END
        `,
        'phraseMatch',
      )
      .addSelect(
        `MATCH (p.search_document) AGAINST (:strictBooleanKeyword IN BOOLEAN MODE)`,
        'allTermScore',
      )
      .addSelect(
        `MATCH(p.search_document) AGAINST(:rawKeyword IN NATURAL LANGUAGE MODE)`,
        'naturalScore',
      )
      .addSelect(
        `MATCH(p.search_document) AGAINST(:booleanKeyword IN BOOLEAN MODE)`,
        'prefixScore',
      )
      .setParameters({
        rawKeyword: searchTerms.rawKeyword,
        booleanKeyword: searchTerms.relaxedBooleanKeyword,
        strictBooleanKeyword: searchTerms.strictBooleanKeyword,
        phraseKeyword: searchTerms.phraseKeyword,
      });
  }

  private sortByRelevancy(query: SelectQueryBuilder<Product>) {
    query
      .addOrderBy(`exactName`, 'DESC')
      .addOrderBy(`prefixMatch`, 'DESC')
      .addOrderBy(`phraseMatch`, 'DESC')
      .addOrderBy(`(allTermScore > 0)`, 'DESC')
      .addOrderBy(`naturalScore`, 'DESC')
      .addOrderBy(`prefixScore`, 'DESC');
  }

  private addProductSearchSelectFields(
    query: SelectQueryBuilder<Product>,
    productSearchOptions?: ProductSearchOptions,
  ): void {
    query.select([
      'p.id AS productId',
      'p.name AS productName',
      'pph.thumbnail AS thumbnail',
      'pv.minPrice AS minPrice',
    ]);
    if (productSearchOptions?.searchTerms) {
      this.addSelectCalculatedRelevancy(
        query,
        productSearchOptions.searchTerms,
      );
    }
  }

  private filterPurchasableProducts(query: SelectQueryBuilder<Product>): void {
    query.andWhere('p.isActive = :pIsActive AND p.isDeleted = :pIsDeleted', {
      pIsActive: true,
      pIsDeleted: false,
    });
  }

  private async getProductsRawAndCount(
    dataQuery: SelectQueryBuilder<Product>,
    countQuery: SelectQueryBuilder<Product>,
  ): Promise<[ProductRaw[], number]> {
    return await Promise.all([
      dataQuery.getRawMany<ProductRaw>(),
      countQuery.getCount(),
    ]);
  }

  async findActiveProductsWithOptionalQueryParams(
    productSearchOptions: ProductSearchOptions,
  ): Promise<[ProductRaw[], number]> {
    const productQuery = this.createProductSearchQueryBuilderWithMinPrice();

    this.applyProductSearchFilters(productQuery, productSearchOptions);

    this.filterPurchasableProducts(productQuery);

    const dataQuery = productQuery.clone();
    const countQuery = productQuery.clone();

    this.populateProductPrimaryPhoto(dataQuery);
    this.addProductSearchSelectFields(dataQuery, productSearchOptions);
    this.applyProductSearchSorting(dataQuery, productSearchOptions);

    dataQuery
      .limit(productSearchOptions.size)
      .offset((productSearchOptions.page - 1) * productSearchOptions.size);

    const [items, count] = await this.getProductsRawAndCount(
      dataQuery,
      countQuery,
    );
    return [items, count ?? 0];
  }

  async findProductByIdAndShopId(
    productId: string,
    shopId: string,
  ): Promise<Product | null> {
    return this.productsRepository.findOne({
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
    const productQuery = this.productsRepository
      .createQueryBuilder('p')
      .leftJoin(
        (subQ) =>
          subQ
            .select(['MIN(v.price) AS minPrice', 'v.productId AS productId'])
            .from(ProductVariant, 'v')
            .groupBy('v.productId'),
        'pv',
        'pv.productId = p.id',
      )
      .andWhere('p.shopId = :shopId', { shopId: shopId })
      .orderBy('p.createdAt', 'DESC')
      .addOrderBy('p.id', 'ASC');

    const countQuery = productQuery.clone();

    this.populateProductPrimaryPhoto(productQuery);
    this.addProductSearchSelectFields(productQuery);
    productQuery.addSelect([
      'p.isActive AS isActive',
      'p.isDeleted AS isDeleted',
    ]);

    productQuery.limit(size).offset((page - 1) * size);
    const [items, count] = await this.getProductsRawAndCount(
      productQuery,
      countQuery,
    );
    return [items, count ?? 0];
  }

  async findActiveProductByVariantId(
    variantId: string,
  ): Promise<Product | null> {
    return this.productsRepository.findOne({
      where: { variants: { id: variantId }, isActive: true, isDeleted: false },
    });
  }

  async createProductOrThrow(
    shopId: string,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const product = this.productsRepository.create({
      shop: { id: shopId },
      name: productCreateDto.name,
      description: productCreateDto.description,
      isActive: productCreateDto.isActive,
    });
    return this.productsRepository.save(product);
  }

  private createProductDetailsQuery(
    productId: string,
  ): SelectQueryBuilder<Product> {
    return this.productsRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('p.photos', 'pp')
      .leftJoinAndSelect(
        'p.productCategories',
        'pc',
        'pc.isDeleted = :pcIsDeleted',
        {
          pcIsDeleted: false,
        },
      )
      .leftJoinAndSelect('pc.category', 'c', 'c.isActive = :cIsActive', {
        cIsActive: true,
      })
      .where('p.id = :productId', { productId: productId });
  }

  async findProductWithActiveCategoriesById(
    productId: string,
  ): Promise<Product | null> {
    const query = this.createProductDetailsQuery(productId);
    return await query.getOne();
  }

  async findActiveProductWithActiveCategoriesById(
    productId: string,
  ): Promise<Product | null> {
    const query = this.createProductDetailsQuery(productId).andWhere(
      'p.isActive = :pIsActive AND p.isDeleted = :pIsDeleted',
      {
        pIsActive: true,
        pIsDeleted: false,
      },
    );
    return await query.getOne();
  }

  async findAllNewestActiveProducts(
    page: number,
    size: number,
  ): Promise<[ProductRaw[], number]> {
    const productQuery = this.createProductSearchQueryBuilderWithMinPrice();
    productQuery.andWhere(
      'p.isActive = :pIsActive AND p.isDeleted = :pIsDeleted',
      { pIsActive: true, pIsDeleted: false },
    );

    const countQuery = productQuery.clone();

    this.populateProductPrimaryPhoto(productQuery);
    this.addProductSearchSelectFields(productQuery);
    productQuery.orderBy('p.createdAt', 'DESC').addOrderBy('p.id', 'ASC');
    productQuery.limit(size).offset((page - 1) * size);

    const [items, count] = await this.getProductsRawAndCount(
      productQuery,
      countQuery,
    );
    return [items, count ?? 0];
  }

  async findNewestActiveShopProducts(
    shopId: string,
    page: number,
    size: number,
  ): Promise<[ProductRaw[], number]> {
    const productQuery = this.createProductSearchQueryBuilderWithMinPrice();
    this.filterPurchasableProducts(productQuery);
    productQuery.andWhere('p.shopId = :shopId', { shopId: shopId });

    const countQuery = productQuery.clone();

    this.addProductSearchSelectFields(productQuery);

    this.populateProductPrimaryPhoto(productQuery);

    productQuery.orderBy('p.createdAt', 'DESC').addOrderBy('p.id', 'ASC');

    productQuery.limit(size).offset((page - 1) * size);

    const [items, count] = await this.getProductsRawAndCount(
      productQuery,
      countQuery,
    );
    return [items, count ?? 0];
  }

  async checkProductOfShop(
    productId: string,
    shopId: string,
  ): Promise<boolean> {
    return await this.productsRepository.existsBy({
      id: productId,
      shopId: shopId,
    });
  }

  async updateShopProductById(
    productId: string,
    shopId: string,
    productUpdateDto: ProductUpdateRequestDto,
  ): Promise<boolean> {
    const updateResult = await this.productsRepository.update(
      { id: productId, shopId, isDeleted: false },
      productUpdateDto,
    );
    return updateResult.affected === 1;
  }

  async softDeleteShopProductById(
    productId: string,
    shopId: string,
  ): Promise<number> {
    const deletedProduct = await this.productsRepository.update(
      { shopId: shopId, id: productId, isDeleted: false },
      { isDeleted: true },
    );
    return deletedProduct.affected ?? 0;
  }
}
