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
import { Category } from '../../category/entities/category.entity';
import { CategoriesService } from '../../category/services/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly productPhotosRepo: ProductPhotosRepository,
    private readonly userShopService: UserShopService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private async insertPhotosIntoProduct(
    productId: string,
    productPhotosInsertRequestDto: ProductPhotosInsertRequestDto[],
  ) {
    await this.productPhotosRepo.insertPhotosIntoproduct(
      productId,
      productPhotosInsertRequestDto,
    );
  }

  @Transactional()
  async createProduct(
    userId: string,
    productCreateRequestDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    const shopId = (await this.userShopService.findShopByUserId(userId)).id;
    const categories =
      await this.categoriesService.findActiveCategoryEntitiesByIds(
        productCreateRequestDto.categoryIds,
      );
    const createdProduct = await this.productsRepo.createProduct(
      shopId,
      productCreateRequestDto,
      categories,
    );
    const productId = createdProduct.id;
    const productPhotos = productCreateRequestDto.photos;
    await this.insertPhotosIntoProduct(productId, productPhotos);

    return this.toResponseDto(createdProduct);
  }

  async findLatestProducts(
    page: number,
    limit: number,
  ): Promise<ProductResponseDto[]> {
    const foundLatestProducts = await this.productsRepo.findManyLatestProducts(
      page,
      limit,
    );
    return this.toArrayResponseDto(foundLatestProducts);
  }

  async findLatestShopProducts(shopId: string): Promise<ProductResponseDto[]> {
    const foundShopLatestProducts =
      await this.productsRepo.findLatestShopProducts(shopId);
    return this.toArrayResponseDto(foundShopLatestProducts);
  }

  async findProductById(productId: string): Promise<ProductResponseDto> {
    const foundProduct = await this.productsRepo.findProductById(productId);
    return this.toResponseDto(foundProduct);
  }

  async updateShopProductById(
    productId: string,
    userId: string,
    updateProductDto: ProductUpdateDto,
  ): Promise<ProductResponseDto> {
    const updatedProduct = await this.productsRepo.updateShopProductById(
      productId,
      userId,
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
