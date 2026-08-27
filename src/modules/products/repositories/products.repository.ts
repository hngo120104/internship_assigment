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
    size: number,
  ): Promise<[Product[], number]> {
    return await this.productsRepo.findAndCount({
      where: {
        shopId: shopId,
        isDeleted: false,
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
        // variants: {
        //   photo: true,
        // },
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
