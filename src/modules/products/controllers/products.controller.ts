import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductCreateRequestDto } from '../dto/products/product.create.dto';
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
    @Body() productCreateDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    const newProductResponse = await this.productsService.createProduct(
      user.sub,
      productCreateDto,
    );
    return newProductResponse;
  }

  @Public()
  @Get()
  async findManyActiveLatestProducts(): Promise<ProductResponseDto[]> {
    const foundProductsResponse =
      await this.productsService.findLatestActiveProducts(1, 20);
    return foundProductsResponse;
  }

  @Public()
  @Get('shop/:shopId')
  async findLatestActiveProductsByShop(
    @Param('shopId') shopId: string,
  ): Promise<ProductResponseDto[]> {
    const foundLatestShopProductsResponse =
      await this.productsService.findLatestActiveShopProducts(shopId);
    return foundLatestShopProductsResponse;
  }

  @Patch(':productId')
  @Roles(Role.SELLER)
  async updateShopProduct(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') updateProductId: string,
    @Body() updateProductDto: ProductUpdateDto,
  ): Promise<ProductResponseDto> {
    const updatedProductResponse =
      await this.productsService.updateShopProductById(
        updateProductId,
        user.sub,
        updateProductDto,
      );
    return updatedProductResponse;
  }

  @Delete(':productId')
  @Roles(Role.SELLER)
  async deleteShopProduct(
    @CurrentUser() user: CurrentUserPayload,
    @Param('productId') deleteProductId: string,
  ): Promise<ProductResponseDto> {
    const deletedProductResponse =
      await this.productsService.deleteShopProductById(
        deleteProductId,
        user.sub,
      );
    return deletedProductResponse;
  }
}
