import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductCreateDto } from '../dto/products/product.create.dto';
import { ProductUpdateDto } from '../dto/products/product.update.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { Public } from '../../auth/public.decorator';
import { ProductResponseDto } from '../dto/products/product.response.dto';
import { CurrentUser } from '../../../custom.decorators/current.user.decorator';
import type { CurrentUserPayload } from '../../../custom.decorators/current.user.decorator';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.SELLER)
  async createProducts(
    @CurrentUser() user: CurrentUserPayload,
    @Body() productCreateDto: ProductCreateDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.createProduct(user.sub, productCreateDto);
  }

  @Public()
  @Get()
  async findManyActiveLatestProducts(
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<ProductResponseDto[]> {
    return await this.productsService.findLatestActiveProducts(page, limit);
  }

  @Public()
  @Get('/:productId')
  async getProductDetails(
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    return await this.productsService.findActiveProductByIdOrThrow(productId);
  }

  @Public()
  @Get('shop/:shopId')
  async findLatestActiveProductsByShop(
    @Param('shopId') shopId: string,
  ): Promise<ProductResponseDto[]> {
    return await this.productsService.findLatestActiveShopProducts(shopId);
  }

  @Patch(':productId')
  @Roles(Role.SELLER)
  async updateShopProduct(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') updateProductId: string,
    @Body() updateProductDto: ProductUpdateDto,
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateShopProductById(
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
    @Body() categoryIds: string[],
  ): Promise<ProductResponseDto> {
    return await this.productsService.updateShopProductCategories(
      updateProductId,
      user.sub,
      categoryIds,
    );
  }

  @Delete(':productId')
  @Roles(Role.SELLER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShopProduct(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') deleteProductId: string,
  ): Promise<void> {
    await this.productsService.deleteShopProductByIdOrThrow(
      deleteProductId,
      user.sub,
    );
  }
}
