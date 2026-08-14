import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductCreateRequestDto } from '../dto/products/request/product.create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product.update.request.dto';
import { BadRequestException } from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductResponseDto } from '../dto/products/response/product.response.dto';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { ProductPhotoInsertRequestDto } from '../dto/product.photos/request/product.photos.insert.request.dto';
import { Transactional } from 'typeorm-transactional';
import { UserShopService } from '../../users/services/user.shop.service';
import { ProductCategoriesRepository } from '../repositories/product.categories.repository';
import { Shop } from '../../users/entities/shop.entity';
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
  ) {}

  async findProductEntityByIdAndLockForUpdateOrThrow(
    productId: string,
  ): Promise<Product> {
    const foundLockedProduct =
      await this.productsRepo.findProductByIdAndLock(productId);
    if (!foundLockedProduct) {
      throw new NotFoundException('Locked product not found.');
    }
    return foundLockedProduct;
  }

  async findShopEntityByProductIdOrThrow(productId: string): Promise<Shop> {
    const foundShop =
      await this.productsRepo.findActiveShopByProductId(productId);

    if (!foundShop) {
      throw new NotFoundException('User does not have shop');
    }

    return foundShop;
  }

  async validateProductQuantity(productId: string, quantity: number) {
    const product = await this.findActiveProductEntityByIdOrThrow(productId);
    this.validateRequestedQuantityIsPositiveInteger(quantity);
    this.validateProductHasSufficientStock(product, quantity);
  }

  async validateAndRestockProductQuantity(productId: string, quantity: number) {
    const product =
      await this.findProductEntityByIdAndLockForUpdateOrThrow(productId);
    this.increaseProductStock(product, quantity);
    return await this.productsRepo.saveProduct(product);
  }

  async validateAndReserveProductStock(
    productId: string,
    quantity: number,
  ): Promise<Product> {
    const product =
      await this.findProductEntityByIdAndLockForUpdateOrThrow(productId);

    this.validateRequestedQuantityIsPositiveInteger(quantity);
    this.validateProductHasSufficientStock(product, quantity);
    this.decreaseProductStock(product, quantity);

    return await this.productsRepo.saveProduct(product);
  }

  private validateRequestedQuantityIsPositiveInteger(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException(
        'Product quantity must be a positive integer.',
      );
    }
  }

  private validateProductHasSufficientStock(
    product: Product,
    requestedQuantity: number,
  ): void {
    if (product.amount < requestedQuantity) {
      throw new BadRequestException(
        `Your amount: ${requestedQuantity}. Product amount is not enough: ${product.amount}`,
      );
    }
  }

  private increaseProductStock(product: Product, quantity: number): void {
    product.amount += quantity;
  }

  private decreaseProductStock(product: Product, quantity: number): void {
    product.amount -= quantity;
  }

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

  async deleteShopProductByIdOrThrow(
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
