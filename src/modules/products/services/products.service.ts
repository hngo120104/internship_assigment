import { Injectable } from '@nestjs/common';
import { ProductCreateRequestDto } from '../dto/products/product.create.dto';
import { ProductUpdateDto } from '../dto/products/product.update.dto';

import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductResponseDto } from '../dto/products/product.response.dto';
import { plainToInstance } from 'class-transformer';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { ProductPhotosInsertRequestDto } from '../dto/product.photos/product.photos.insert.request.dto';
import { Transactional } from 'typeorm-transactional';
import { UserShopService } from '../../users/services/user.shop.service';
import { CategoriesService } from '../../category/services/categories.service';
import { ProductCategoriesRepository } from '../repositories/product.categories.repository';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly productPhotosRepo: ProductPhotosRepository,
    private readonly userShopService: UserShopService,
    private readonly categoriesService: CategoriesService,
    private readonly productCategoriesRepo: ProductCategoriesRepository,
  ) {}

  private async insertPhotosIntoProduct(
    productId: string,
    createdProduct: Product,
    productPhotosInsertRequestDto: ProductPhotosInsertRequestDto[],
  ) {
    const insertedPhotos = await this.productPhotosRepo.insertPhotosIntoProduct(
      productId,
      productPhotosInsertRequestDto,
    );
    createdProduct.photos = insertedPhotos;
  }

  async proccessCreateProduct(
    userId: string,
    productCreateRequestDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const shopId = (await this.userShopService.findShopByUserId(userId)).id;
    const createdProduct = await this.productsRepo.createProduct(
      shopId,
      productCreateRequestDto,
    );

    const createdProductCategories =
      await this.productCategoriesRepo.saveProductCategories(
        createdProduct.id,
        productCreateRequestDto.categoryIds,
      );

    createdProduct.productCategories = createdProductCategories;

    const productPhotos = productCreateRequestDto.photos;
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
    productCreateRequestDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    const createdProduct = await this.proccessCreateProduct(
      userId,
      productCreateRequestDto,
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
    return this.toResponseDto(foundProduct);
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
  ): Promise<ProductResponseDto> {
    const deletedProduct = await this.productsRepo.softDeleteShopProductById(
      productId,
      userId,
    );
    return this.toResponseDto(deletedProduct);
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
