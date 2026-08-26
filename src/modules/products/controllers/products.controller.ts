import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductCreateRequestDto } from '../dto/products/request/product.create.request.dto';
import { ProductUpdateRequestDto } from '../dto/products/request/product.update.request.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { Public } from '../../auth/public.decorator';
import { ProductResponseDto } from '../dto/products/response/product.response.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';
import { ProductVariantUpdateRequestDto } from '../dto/product.variants/request/product.variant.update.request.dto';
import { ProductVariantsService } from '../services/product.variants.service';
import { ProductVariantResponseDto } from '../dto/product.variants/response/product.variant.response.dto';
import { toListResponseDtos } from '../../../utils/to.dto.response';
import { ProductCategoriesUpdateRequestDto } from '../dto/products/request/product.categories.update.request.dto';
import { ProductVariantsCreateRequestDto } from '../dto/product.variants/request/product.variants.create.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { DeleteCountResponseDto } from '../../../common/dto/delete.count.response.dto';
import { PaginationQueryDto } from '../../../common/dto/pagination.request.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Public()
  @Get()
  async findAllActiveLatestProducts(
    @Query() paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    return await this.productsService.findLatestActiveProducts(
      paginationRequest,
    );
  }

  @Post()
  @Roles(Role.SELLER)
  async createProductOrThrow(
    @CurrentUser() user: CurrentUserPayload,
    @Body() productCreateDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.createProductOrThrow(
      user.shopId,
      productCreateDto,
    );
  }

  @Roles(Role.SELLER)
  @Get('shops')
  async sellerViewShopProducts(
    @CurrentUser() user: CurrentUserPayload,
    @Query() paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    return await this.productsService.findAllUserShopProductsOrThrow(
      paginationRequest,
      user.shopId,
    );
  }

  @Public()
  @Get('shops/:shopId')
  async findLatestActiveProductsByShop(
    @Param('shopId') shopId: string,
    @Query() paginationRequest: PaginationQueryDto,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    return await this.productsService.findLatestActiveShopProducts(
      shopId,
      paginationRequest,
    );
  }

  @Public()
  @Get(':productId')
  async getProductDetails(
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    return await this.productsService.findActiveProductByIdOrThrow(productId);
  }

  @Patch(':productId')
  @Roles(Role.SELLER)
  async updateShopProductMetadata(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') updateProductId: string,
    @Body() updateProductDto: ProductUpdateRequestDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateShopProductByIdOrThrow(
      updateProductId,
      updateProductDto,
      user.shopId,
    );
  }

  @Patch('categories/:productId')
  @Roles(Role.SELLER)
  async updateShopProductCategoriesOrThrow(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') updateProductId: string,
    @Body() requestDto: ProductCategoriesUpdateRequestDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateShopProductCategoriesOrThrow(
      updateProductId,
      requestDto.categoryIds,
      user.shopId,
    );
  }

  @Post(':productId/variants')
  @Roles(Role.SELLER)
  async addProductVariants(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') productId: string,
    @Body() requestDto: ProductVariantsCreateRequestDto,
  ): Promise<ListResponseDto<ProductVariantResponseDto>> {
    const createdVariants =
      await this.productVariantsService.createProductVariants(
        productId,
        requestDto.variants,
        user.shopId,
      );
    return new ListResponseDto(
      toListResponseDtos(ProductVariantResponseDto, createdVariants),
      createdVariants.length,
    );
  }

  @Patch(':productId/:variantId')
  @Roles(Role.SELLER)
  async updateProductVariant(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() productVariantUpdateRequestDto: ProductVariantUpdateRequestDto,
  ): Promise<ProductVariantResponseDto> {
    return await this.productVariantsService.updateProductVariant(
      variantId,
      productId,
      productVariantUpdateRequestDto,
      user.shopId,
    );
  }

  @Delete(':productId/:variantId')
  @Roles(Role.SELLER)
  async deleteProductVariant(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount =
      await this.productVariantsService.softDeleteProductVariantOrThrow(
        variantId,
        productId,
        user.shopId,
      );
    return new DeleteCountResponseDto(deletedCount);
  }

  @Delete(':productId')
  @Roles(Role.SELLER)
  async deleteShopProduct(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') deleteProductId: string,
  ): Promise<DeleteCountResponseDto> {
    const deletedCount =
      await this.productsService.softDeleteShopProductByIdOrThrow(
        deleteProductId,
        user.shopId,
      );
    return new DeleteCountResponseDto(deletedCount);
  }
}
