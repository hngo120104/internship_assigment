import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProductCreateRequestDto } from '../dto/products/request/product-create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product-update.request.dto';
import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductResponseDto } from '../dto/products/response/product.response.dto';
import { ProductPhotosRepository } from '../repositories/product-photos.repository';
import { ProductPhotoInsertRequestDto } from '../dto/product-photos/request/product-photo-insert.request.dto';
import { Transactional } from 'typeorm-transactional';
import { ProductCategoriesRepository } from '../repositories/product-categories.repository';
import { ProductVariantsService } from './product-variants.service';
import {
  toListResponseDtos,
  toResponseDto,
} from '../../../utils/response-dto.mapper';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { CategoriesService } from '../../categories/services/categories.service';
import { ProductSearchResponseDto } from '../../search/dto/response/product-search.response.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly productPhotosRepository: ProductPhotosRepository,
    private readonly productCategoriesRepository: ProductCategoriesRepository,
    private readonly productVariantsService: ProductVariantsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAllUserShopProductsOrThrow(
    paginationRequest: PaginationQueryDto,
    shopId?: string,
  ): Promise<ListResponseDto<ProductSearchResponseDto>> {
    if (!shopId) {
      throw new UnauthorizedException('User account is not a seller.');
    }
    const [userShopProducts, count] =
      await this.productsRepository.findAllUserShopProductsByShopId(
        shopId,
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(
      ProductSearchResponseDto,
      userShopProducts,
    );
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
    const insertedPhotos =
      await this.productPhotosRepository.insertPhotosIntoProduct(
        productId,
        productPhotosInsertDto,
      );
    createdProduct.photos = insertedPhotos;
  }

  private async processCreateProduct(
    shopId: string,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const createdProduct = await this.productsRepository.createProductOrThrow(
      shopId,
      productCreateDto,
    );
    if (productCreateDto.variants) {
      createdProduct.variants =
        await this.productVariantsService.createProductVariants(
          createdProduct.id,
          productCreateDto.variants,
          shopId,
        );
    }
    const productCategories =
      await this.categoriesService.findActiveCategoriesEntitiesByIdsOrThrow(
        productCreateDto.categoryIds,
      );

    const createdProductCategories =
      await this.productCategoriesRepository.saveProductCategories(
        createdProduct,
        productCategories,
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
      throw new UnauthorizedException('User account is not a seller.');
    }
    const createdProduct = await this.processCreateProduct(
      shopId,
      productCreateDto,
    );
    return toResponseDto(ProductResponseDto, createdProduct);
  }

  async findProductEntityWithActiveCategoriesOrThrow(
    productId: string,
  ): Promise<Product> {
    const product =
      await this.productsRepository.findProductWithActiveCategoriesById(
        productId,
      );
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return product;
  }

  async findProductWithActiveCategoriesOrThrow(
    productId: string,
  ): Promise<ProductResponseDto> {
    const product =
      await this.productsRepository.findProductWithActiveCategoriesById(
        productId,
      );
    return toResponseDto(ProductResponseDto, product);
  }

  async findActiveProductWithActiveCategoriesOrThrow(
    productId: string,
  ): Promise<ProductResponseDto> {
    const product =
      await this.productsRepository.findActiveProductWithActiveCategoriesById(
        productId,
      );
    if (!product) {
      throw new NotFoundException('No valid products found');
    }
    return toResponseDto(ProductResponseDto, product);
  }

  async findNewestActiveProducts(
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ProductSearchResponseDto>> {
    const [foundNewestProducts, count] =
      await this.productsRepository.findAllNewestActiveProducts(
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(
      ProductSearchResponseDto,
      foundNewestProducts,
    );
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
  }

  async findNewestActiveShopProducts(
    shopId: string,
    paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ProductSearchResponseDto>> {
    const [foundShopNewestProducts, count] =
      await this.productsRepository.findNewestActiveShopProducts(
        shopId,
        paginationRequest.page,
        paginationRequest.size,
      );
    const response = toListResponseDtos(
      ProductSearchResponseDto,
      foundShopNewestProducts,
    );
    return new ListResponseDto(
      response,
      count,
      paginationRequest.page,
      paginationRequest.size,
    );
  }

  async checkProductOfShop(
    productId: string,
    shopId: string,
  ): Promise<boolean> {
    return await this.productsRepository.checkProductOfShop(productId, shopId);
  }

  @Transactional()
  async sellerUpdateProductCategoriesOrThrow(
    productId: string,
    categoryIds: string[],
    shopId?: string,
  ): Promise<ProductResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User account is not a seller.');
    }
    await this.categoriesService.checkCategoriesExistingByIdsOrThrow(
      categoryIds,
    );
    if (!(await this.checkProductOfShop(productId, shopId))) {
      throw new NotFoundException(`Shop doesn't have this product.`);
    }
    await this.productCategoriesRepository.replaceProductCategories(
      productId,
      categoryIds,
    );
    const product =
      await this.findProductEntityWithActiveCategoriesOrThrow(productId);
    return toResponseDto(ProductResponseDto, product);
  }

  async updateShopProductByIdOrThrow(
    productId: string,
    updateProductDto: ProductUpdateRequestDto,
    shopId?: string,
  ): Promise<ProductResponseDto> {
    if (!shopId) {
      throw new UnauthorizedException('User account is not a seller.');
    }
    const updateResult = await this.productsRepository.updateShopProductById(
      productId,
      shopId,
      updateProductDto,
    );
    if (!updateResult) {
      throw new NotFoundException('Product not found.');
    }
    const updatedProduct =
      await this.productsRepository.findProductWithActiveCategoriesById(
        productId,
      );
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
      throw new UnauthorizedException('User account is not a seller.');
    }
    const deletedCount =
      await this.productsRepository.softDeleteShopProductById(
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
