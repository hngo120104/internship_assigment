import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductCreateRequestDto } from '../dto/products/request/product.create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product.update.request.dto';
import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductResponseDto } from '../dto/products/response/product.response.dto';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { ProductPhotoInsertRequestDto } from '../dto/product.photos/request/product.photos.insert.request.dto';
import { Transactional } from 'typeorm-transactional';
import { ProductCategoriesRepository } from '../repositories/product.categories.repository';
import { ProductVariantsService } from './product.variants.service';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/to.dto.response';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { CategoriesService } from '../../category/services/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepo: ProductsRepository,
    private readonly productPhotosRepo: ProductPhotosRepository,
    private readonly productCategoriesRepo: ProductCategoriesRepository,
    private readonly productVariantsService: ProductVariantsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAllUserShopProductsOrThrow(
    paginationRequest: PaginationQueryDto,
    shopId?: string,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const [userShopProducts, count] =
      await this.productsRepo.findAllUserShopProductByShopId(
        shopId,
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(ProductResponseDto, userShopProducts);
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
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

  private async processCreateProduct(
    shopId: string,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const createdProduct = await this.productsRepo.createProductOrThrow(
      shopId,
      productCreateDto,
    );
    createdProduct.variants =
      await this.productVariantsService.createProductVariants(
        createdProduct.id,
        productCreateDto.variants,
        shopId,
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
  async createProductOrThrow(
    shopId: string | undefined,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const createdProduct = await this.processCreateProduct(
      shopId,
      productCreateDto,
    );
    return toResponseDto(ProductResponseDto, createdProduct);
  }

  async findLatestActiveProducts(
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    const [foundLatestProducts, count] =
      await this.productsRepo.findAllLatestActiveProducts(
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(
      ProductResponseDto,
      foundLatestProducts,
    );
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
  }

  async findLatestActiveShopProducts(
    shopId: string,
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    const [foundShopLatestProducts, count] =
      await this.productsRepo.findLatestActiveShopProducts(
        shopId,
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(
      ProductResponseDto,
      foundShopLatestProducts,
    );
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
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

  //TODO: need better validate
  async updateShopProductCategoriesOrThrow(
    productId: string,
    categoryIds: string[],
    shopId?: string,
  ): Promise<ProductResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    await this.categoriesService.checkCategoriesExistingByIdsOrThrow(
      categoryIds,
    );
    const product = await this.findActiveProductEntityByIdOrThrow(productId);
    if (product.shopId !== shopId) {
      throw new NotFoundException('Product does not exist in your shop.');
    }
    const upsertResult =
      await this.productCategoriesRepo.upsertProductCategories(
        productId,
        categoryIds,
      );
    console.log(upsertResult);
    return this.findActiveProductByIdOrThrow(productId);
  }

  async updateShopProductByIdOrThrow(
    productId: string,
    updateProductDto: ProductUpdateRequestDto,
    shopId?: string,
  ): Promise<ProductResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
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
    shopId?: string,
  ): Promise<number> {
    if (!shopId) {
      throw new UnauthorizedException('User does not have shop.');
    }
    const deletedCount = await this.productsRepo.softDeleteShopProductById(
      productId,
      shopId,
    );
    if (deletedCount !== 1) {
      throw new NotFoundException(
        'Product does not exist or is already deleted.',
      );
    }
    return deletedCount;
  }
}
