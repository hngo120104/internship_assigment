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

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productVariantsService: ProductVariantsService,
  ) {}

  @Post()
  @Roles(Role.SELLER)
  async createProduct(
    @CurrentUser() user: CurrentUserPayload,
    @Body() productCreateDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.createProduct(user.sub, productCreateDto);
  }

  @Public()
  @Get()
  async findManyActiveLatestProducts(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    return new ListResponseDto(
      await this.productsService.findLatestActiveProducts(page, limit),
    );
  }

  @Roles(Role.SELLER)
  @Get('shops')
  async sellerViewShopProducts(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    return new ListResponseDto(
      await this.productsService.findALlUserShopProductsOrThrow(
        user.sub,
        page,
        limit,
      ),
    );
  }

  @Public()
  @Get(':productId')
  async getProductDetails(
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    return await this.productsService.findActiveProductByIdOrThrow(productId);
  }

  @Public()
  @Get('shops/:shopId')
  async findLatestActiveProductsByShop(
    @Param('shopId') shopId: string,
  ): Promise<ListResponseDto<ProductResponseDto>> {
    return new ListResponseDto(
      await this.productsService.findLatestActiveShopProducts(shopId),
    );
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
      user.sub,
      updateProductDto,
    );
  }

  @Patch('categories/:productId')
  @Roles(Role.SELLER)
  async updateShopProductCategories(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') updateProductId: string,
    @Body() requestDto: ProductCategoriesUpdateRequestDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateShopProductCategories(
      updateProductId,
      user.sub,
      requestDto.categoryIds,
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
        user.sub,
        productId,
        requestDto.variants,
      );
    return new ListResponseDto(
      toListResponseDtos(ProductVariantResponseDto, createdVariants),
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
      user.sub,
      variantId,
      productId,
      productVariantUpdateRequestDto,
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
        user.sub,
        variantId,
        productId,
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
        user.sub,
      );
    return new DeleteCountResponseDto(deletedCount);
  }
}
