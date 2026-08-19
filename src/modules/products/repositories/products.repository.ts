import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateRequestDto } from '../dto/products/request/product.create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product.update.request.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async findProductByIdAndShopId(
    productId: string,
    shopId: string,
  ): Promise<Product | null> {
    return this.productsRepo.findOne({
      where: { id: productId, shopId: shopId, isDeleted: false },
    });
  }

  async findAllUserShopProductByShopId(
    shopId: string,
    page: number,
    limit: number,
  ): Promise<Product[]> {
    return await this.productsRepo.find({
      where: {
        shopId: shopId,
        isDeleted: false,
      },
      relations: {
        variants: true,
      },
      skip: (page - 1) * limit,
      take: limit,
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

  async createProduct(
    shopId: string,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const product = this.productsRepo.create({
      shop: { id: shopId },
      shopId,
      name: productCreateDto.name,
      description: productCreateDto.description,
      isActive: productCreateDto.isActive,
    });
    return this.productsRepo.save(product);
  }

  findManyLatestActiveProducts(
    page: number,
    limit: number,
  ): Promise<Product[]> {
    return this.productsRepo.find({
      where: {
        isActive: true,
        isDeleted: false,
        variants: {
          isActive: true,
          isDeleted: true,
        },
      },
      relations: {
        shop: true,
        photos: true,
        variants: true,
        productCategories: { category: true },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findLatestActiveShopProducts(shopId: string): Promise<Product[]> {
    return this.productsRepo.find({
      where: {
        isActive: true,
        isDeleted: false,
        shopId: shopId,
        variants: {
          isActive: true,
          isDeleted: true,
        },
      },
      relations: {
        shop: true,
        photos: true,
        variants: true,
        productCategories: { category: true },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findActiveProductById(productId: string): Promise<Product | null> {
    const foundProduct = await this.productsRepo.findOne({
      where: {
        id: productId,
        isActive: true,
        isDeleted: false,
        variants: {
          isActive: true,
          isDeleted: true,
        },
      },
      relations: {
        shop: true,
        photos: true,
        variants: true,
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
