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

  async findPurchasableProductsByText(
    formattedQuery: string,
    page: number,
    size: number,
    minPrice?: number,
    maxPrice?: number,
    categoryIds?: string[],
    orderBy?: ProductSearchSort,
  ): Promise<[ProductRaw[], number]> {
    const qb = this.productsRepo.createQueryBuilder('p');
    qb.leftJoin(
      'p.photos',
      'pp',
      'pp.isPrimary = :ppIsPrimary AND pp.isDeleted = :ppIsDeleted',
      { ppIsPrimary: true, ppIsDeleted: false },
    )
      .innerJoin(
        (subQuery) =>
          subQuery
            .select('v.productId', 'product_id')
            .addSelect('MIN(v.price)', 'min_price')
            .from(ProductVariant, 'v')
            .where('v.isDeleted = :vIsDeleted AND v.isActive = :vIsActive', {
              vIsDeleted: false,
              vIsActive: true,
            })
            .groupBy('v.productId'),
        'pv',
        'pv.product_id = p.id',
      )
      .select([
        'p.id AS id',
        'p.name AS productName',
        'pp.url AS thumbnail',
        'pv.min_price AS minPrice',
      ])
      .addSelect(
        'MATCH (p.search_document) AGAINST (:formattedQuery IN BOOLEAN MODE)',
        'relevance',
      )
      .where(
        'MATCH (p.search_document) AGAINST (:formattedQuery IN BOOLEAN MODE)',
        { formattedQuery: formattedQuery },
      )
      .andWhere('p.isDeleted = :pIsDeleted', { pIsDeleted: false })
      .andWhere('p.isActive = :pIsActive', { pIsActive: true });
    if (categoryIds && categoryIds.length > 0) {
      qb.andWhere(
        (subQuery) => {
          const sq = subQuery
            .select('1')
            .from(ProductCategories, 'pc')
            .where('pc.productId = p.id')
            .andWhere('pc.isDeleted = :pcIsDeleted')
            .andWhere('pc.categoryId IN (:...categoryIds)')
            .getQuery();
          return `EXISTS ${sq}`;
        },
        {
          pcIsDeleted: false,
          categoryIds: categoryIds,
        },
      );
    }
    if (minPrice !== undefined) {
      qb.andWhere('pv.min_price >= :minPrice', { minPrice: minPrice });
    }
    if (maxPrice !== undefined) {
      qb.andWhere('pv.min_price <= :maxPrice', { maxPrice: maxPrice });
    }

    switch (orderBy) {
      case ProductSearchSort.RELAVANCE:
        qb.orderBy('relevance', 'DESC');
        break;
      case ProductSearchSort.NEWEST:
        qb.orderBy('p.createdAt', 'DESC');
        break;
      case ProductSearchSort.PRICEASC:
        qb.orderBy('pv.min_price', 'ASC');
        break;
      case ProductSearchSort.PRICEDESC:
        qb.orderBy('pv.min_price', 'DESC');
        break;
      default:
        qb.orderBy('relevance', 'DESC');
        break;
    }
    const dataQb = qb.clone();
    const countQb = qb.clone();
    const [items, totalCount] = await Promise.all([
      dataQb
        .take(page)
        .skip((page - 1) * size)
        .getRawMany<ProductRaw>(),

      countQb
        .select(`COUNT(DISTINCT p.id)`, 'total')
        .orderBy()
        .getRawOne<{ total: string }>(),
    ]);
    const total = Number(totalCount?.total ?? 0);

    return [items, total];
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

  findAllLatestActiveProducts(
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

  async findLatestActiveShopProducts(
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
