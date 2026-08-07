import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductCreateDto } from '../dto/products/product.create.dto';
import { ProductUpdateDto } from '../dto/products/product.update.dto';

import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductResponseDto } from '../dto/products/product.response.dto';
import { plainToInstance } from 'class-transformer';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { ProductPhotosInsertDto } from '../dto/product.photos/product.photos.insert.dto';
import { Transactional } from 'typeorm-transactional';
import { UserShopService } from '../../users/services/user.shop.service';
import { ProductCategoriesRepository } from '../repositories/product.categories.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly productPhotosRepo: ProductPhotosRepository,
    private readonly userShopService: UserShopService,
    private readonly productCategoriesRepo: ProductCategoriesRepository,
  ) {}

  private async insertPhotosIntoProduct(
    productId: string,
    createdProduct: Product,
    productPhotosInsertDto: ProductPhotosInsertDto[],
  ) {
    const insertedPhotos = await this.productPhotosRepo.insertPhotosIntoProduct(
      productId,
      productPhotosInsertDto,
    );
    createdProduct.photos = insertedPhotos;
  }

  async proccessCreateProduct(
    userId: string,
    productCreateDto: ProductCreateDto,
  ): Promise<Product> {
    const shopId = (await this.userShopService.findShopByUserId(userId)).id;
    const createdProduct = await this.productsRepo.createProduct(
      shopId,
      productCreateDto,
    );

    const createdProductCategories =
      await this.productCategoriesRepo.saveProductCategories(
        createdProduct.id,
        productCreateDto.categoryIds,
      );

    createdProduct.productCategories = createdProductCategories;

    const productPhotos = productCreateDto.photos;
    await this.insertPhotosIntoProduct(
      createdProduct.id,
      createdProduct,
      productPhotos,
    );

    return createdProduct;
  }

  @Transactional()
  async createProduct(
    userId: string,
    productCreateDto: ProductCreateDto,
  ): Promise<ProductResponseDto> {
    const createdProduct = await this.proccessCreateProduct(
      userId,
      productCreateDto,
    );
    return this.toResponseDto(createdProduct);
  }

  async findLatestActiveProducts(
    page: number,
    limit: number,
  ): Promise<ProductResponseDto[]> {
    const foundLatestProducts =
      await this.productsRepo.findManyLatestActiveProducts(page, limit);
    return this.toArrayResponseDto(foundLatestProducts);
  }

  async findLatestActiveShopProducts(
    shopId: string,
  ): Promise<ProductResponseDto[]> {
    const foundShopLatestProducts =
      await this.productsRepo.findLatestActiveShopProducts(shopId);
    return this.toArrayResponseDto(foundShopLatestProducts);
  }

  async findActiveProductById(productId: string): Promise<ProductResponseDto> {
    const foundProduct =
      await this.productsRepo.findActiveProductById(productId);
    if (!foundProduct) throw new NotFoundException('Product not found.');
    return this.toResponseDto(foundProduct);
  }

  async findActiveProductEntityById(productId: string): Promise<Product> {
    const foundProduct =
      await this.productsRepo.findActiveProductById(productId);
    if (!foundProduct) throw new NotFoundException('Product not found.');

    return foundProduct;
  }

  async updateShopProductCategories(
    productId: string,
    userId: string,
    categoryIds: string[],
  ): Promise<ProductResponseDto> {
    const shopId = (await this.userShopService.findShopByUserId(userId)).id;
    const product = await this.findActiveProductEntityById(productId);
    if (product.shopId !== shopId) {
      throw new NotFoundException('Product does not exist in your shop.');
    }
    await this.productCategoriesRepo.updateProductCategories(
      productId,
      categoryIds,
    );
    return this.findActiveProductById(productId);
  }

  async updateShopProductById(
    productId: string,
    userId: string,
    updateProductDto: ProductUpdateDto,
  ): Promise<ProductResponseDto> {
    const shopId = (await this.userShopService.findShopByUserId(userId)).id;
    const updatedProduct = await this.productsRepo.updateShopProductById(
      productId,
      shopId,
      updateProductDto,
    );
    return this.toResponseDto(updatedProduct);
  }

  async deleteShopProductById(
    productId: string,
    userId: string,
  ): Promise<void> {
    const foundShop = await this.userShopService.findShopByUserId(userId);
    const isDeleted = await this.productsRepo.softDeleteShopProductById(
      productId,
      foundShop.id,
    );
    if (!isDeleted) {
      throw new NotFoundException(
        'Product does not exist or is already deleted.',
      );
    }
  }

  private toResponseDto(product: Product): ProductResponseDto {
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  private toArrayResponseDto(products: Product[]): ProductResponseDto[] {
    return plainToInstance(ProductResponseDto, products, {
      excludeExtraneousValues: true,
    });
  }
}
