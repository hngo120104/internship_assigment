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

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async findActiveProductsWithOptionalQueryParams(
    page: number,
    size: number,
    formattedKeyword?: string,
    minPrice?: number,
    maxPrice?: number,
    categoryIds?: string[],
    orderBy?: ProductSearchSort,
  ): Promise<[ProductRaw[], number]> {
    const createQb = (alias: string) => {
      const qb = this.productsRepo.createQueryBuilder(alias);

      qb.innerJoin(
        (subQ) =>
          subQ
            .select('v.productId', 'productId')
            .addSelect('MIN(v.price)', 'minPrice')
            .addSelect('MAX(v.price)', 'maxPrice')
            .from(ProductVariant, 'v')
            .where('v.isActive = 1')
            .andWhere('v.isDeleted = 0')
            .groupBy('productId'),
        'pv',
        `pv.productId = ${alias}.id`,
      );
      qb.where(`${alias}.isActive = 1`).andWhere(`${alias}.isDeleted = 0`);

      if (formattedKeyword) {
        qb.andWhere(
          `MATCH (${alias}.search_document) AGAINST (:keyword IN BOOLEAN MODE)`,
          { keyword: formattedKeyword },
        );
      }

      if (minPrice !== undefined) {
        qb.andWhere(`pv.maxPrice >= :minPrice`, { minPrice: minPrice });
      }

      if (maxPrice !== undefined) {
        qb.andWhere(`pv.minPrice <= :maxPrice`, { maxPrice: maxPrice });
      }

      if (categoryIds && categoryIds.length > 0) {
        qb.andWhere(
          (subQuery) => {
            const sq = subQuery
              .select('1')
              .from(ProductCategories, 'pc')
              .where(`pc.productId = ${alias}.id`)
              .andWhere('pc.isDeleted = :pcIsDeleted')
              .andWhere('pc.categoryId IN (:...categoryIds)')
              .getQuery();
            return `EXISTS ${sq}`;
          },
          { pcIsDeleted: false, categoryIds },
        );
      }
      return qb;
    };

    const dataQb = createQb('p');
    dataQb.leftJoin(
      'p.photos',
      'pp',
      'pp.isPrimary = :ppIsPrimary AND pp.isDeleted = :ppIsDeleted',
      {
        ppIsPrimary: true,
        ppIsDeleted: false,
      },
    );
    dataQb.select([
      'p.id AS productId',
      'p.name AS productName',
      'pp.url AS thumbnail',
      'pv.minPrice AS minPrice',
    ]);

    if (formattedKeyword) {
      dataQb.addSelect(
        `MATCH (p.search_document) AGAINST (:keyword IN BOOLEAN MODE)`,
        'relevancy',
      );
    }

    switch (orderBy) {
      case ProductSearchSort.RELEVANCY:
        if (formattedKeyword) dataQb.orderBy('relevancy', 'DESC');
        else dataQb.orderBy('p.createdAt', 'DESC');
        break;
      case ProductSearchSort.NEWEST:
        dataQb.orderBy('p.createdAt', 'DESC');
        break;
      case ProductSearchSort.PRICEASC:
        dataQb.orderBy('pv.minPrice', 'ASC');
        break;
      case ProductSearchSort.PRICEDESC:
        dataQb.orderBy('pv.minPrice', 'DESC');
        break;
      default:
        if (formattedKeyword) dataQb.orderBy('relevancy', 'DESC');
        else dataQb.orderBy('p.createdAt', 'DESC');
        break;
    }

    dataQb.limit(size).offset((page - 1) * size);

    const countQb = createQb('p').select('COUNT(DISTINCT p.id)', 'count');

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

  async findAllUserShopProductByShopId(
    shopId: string,
    page: number,
    size: number,
  ): Promise<[Product[], number]> {
    return await this.productsRepo.findAndCount({
      where: {
        shopId: shopId,
      },
      relations: {
        variants: true,
      },
      skip: (page - 1) * size,
      take: size,
      order: {
        createdAt: 'DESC',
      },
    });
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

  findAllNewestActiveProducts(
    page: number,
    size: number,
  ): Promise<[Product[], number]> {
    return this.productsRepo.findAndCount({
      where: {
        isActive: true,
        isDeleted: false,
        variants: {
          isActive: true,
          isDeleted: false,
        },
      },
      relations: {
        shop: true,
        photos: true,
        productCategories: { category: true },
      },
      skip: (page - 1) * size,
      take: size,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findNewestActiveShopProducts(
    shopId: string,
    page: number,
    size: number,
  ): Promise<[Product[], number]> {
    return this.productsRepo.findAndCount({
      where: {
        isActive: true,
        isDeleted: false,
        shopId: shopId,
      },
      relations: {
        shop: true,
        photos: true,
        productCategories: { category: true },
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * size,
      take: size,
    });
  }

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
