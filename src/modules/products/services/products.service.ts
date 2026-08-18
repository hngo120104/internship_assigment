import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductCreateRequestDto } from '../dto/products/request/product.create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product.update.request.dto';
import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductResponseDto } from '../dto/products/response/product.response.dto';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { ProductPhotoInsertRequestDto } from '../dto/product.photos/request/product.photos.insert.request.dto';
import { Transactional } from 'typeorm-transactional';
import { UserShopService } from '../../users/services/user.shop.service';
import { ProductCategoriesRepository } from '../repositories/product.categories.repository';
import { ProductVariantsService } from './product.variants.service';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly productPhotosRepo: ProductPhotosRepository,
    private readonly userShopService: UserShopService,
    private readonly productCategoriesRepo: ProductCategoriesRepository,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  private async insertPhotosIntoProduct(
    productId: string,
    createdProduct: Product,
    productPhotosInsertDto: ProductPhotoInsertRequestDto[],
  ) {
    const insertedPhotos = await this.productPhotosRepo.insertPhotosIntoProduct(
      productId,
      productPhotosInsertDto,
    );
    createdProduct.photos = insertedPhotos;
  }

  async processCreateProduct(
    userId: string,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const shopId = (await this.userShopService.findShopByUserIdOrThrow(userId))
      .id;
    const createdProduct = await this.productsRepo.createProduct(
      shopId,
      productCreateDto,
    );
    createdProduct.variants =
      await this.productVariantsService.createProductVariants(
        userId,
        createdProduct.id,
        productCreateDto.variants,
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
    productCreateDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    const createdProduct = await this.processCreateProduct(
      userId,
      productCreateDto,
    );
    return toResponseDto(ProductResponseDto, createdProduct);
  }

  async findLatestActiveProducts(
    page: number,
    limit: number,
  ): Promise<ProductResponseDto[]> {
    const foundLatestProducts =
      await this.productsRepo.findManyLatestActiveProducts(page, limit);
    return toListResponseDtos(ProductResponseDto, foundLatestProducts);
  }

  async findLatestActiveShopProducts(
    shopId: string,
  ): Promise<ProductResponseDto[]> {
    const foundShopLatestProducts =
      await this.productsRepo.findLatestActiveShopProducts(shopId);
    return toListResponseDtos(ProductResponseDto, foundShopLatestProducts);
  }

  async findActiveProductByIdOrThrow(
    productId: string,
  ): Promise<ProductResponseDto> {
    const foundProduct =
      await this.productsRepo.findActiveProductById(productId);
    if (!foundProduct) throw new NotFoundException('Product not found.');
    return toResponseDto(ProductResponseDto, foundProduct);
  }

  async findActiveProductEntityByIdOrThrow(
    productId: string,
  ): Promise<Product> {
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
    const shopId = (await this.userShopService.findShopByUserIdOrThrow(userId))
      .id;
    const product = await this.findActiveProductEntityByIdOrThrow(productId);
    if (product.shopId !== shopId) {
      throw new NotFoundException('Product does not exist in your shop.');
    }
    await this.productCategoriesRepo.updateProductCategories(
      productId,
      categoryIds,
    );
    return this.findActiveProductByIdOrThrow(productId);
  }

  async updateShopProductById(
    productId: string,
    userId: string,
    updateProductDto: ProductUpdateRequestDto,
  ): Promise<ProductResponseDto> {
    const shopId = (await this.userShopService.findShopByUserIdOrThrow(userId))
      .id;
    const updateResult = await this.productsRepo.updateShopProductById(
      productId,
      shopId,
      updateProductDto,
    );
    if (!updateResult) {
      throw new NotFoundException('Product not found.');
    }
    const updatedProduct =
      await this.productsRepo.findActiveProductById(productId);
    if (!updatedProduct) {
      throw new NotFoundException('Updated product not found.');
    }
    return toResponseDto(ProductResponseDto, updatedProduct);
  }

  async softDeleteShopProductByIdOrThrow(
    productId: string,
    userId: string,
  ): Promise<number> {
    const foundShop =
      await this.userShopService.findShopByUserIdOrThrow(userId);
    const deletedCount = await this.productsRepo.softDeleteShopProductById(
      productId,
      foundShop.id,
    );
    if (deletedCount !== 1) {
      throw new NotFoundException(
        'Product does not exist or is already deleted.',
      );
    }
    return deletedCount;
  }
}
