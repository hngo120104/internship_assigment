import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { ProductCreateRequestDto } from '../dto/products/product.create.dto';
import { ProductUpdateDto } from '../dto/products/product.update.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { AuthGuard } from '../../auth/guards/auth/auth.guard';
import { Public } from '../../auth/public.decorator';
import { ProductResponseDto } from '../dto/products/product.response.dto';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('new-product')
  @Roles(Role.SELLER)
  @UseGuards(AuthGuard)
  async createProducts(
    @Request() req,
    @Body() productCreateDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    const userId = req.user.sub;
    const newProductResponse = await this.productsService.createProduct(
      userId,
      productCreateDto,
    );
    return newProductResponse;
  }

  @Public()
  @Get()
  async findManyLatestProducts(): Promise<ProductResponseDto[]> {
    const foundProductsResponse = await this.productsService.findLatestProducts(
      1,
      20,
    );
    return foundProductsResponse;
  }

  @Public()
  @Get('shop/:shopId')
  async findLatestProductsByShop(
    @Param('shopId') shopId: string,
  ): Promise<ProductResponseDto[]> {
    const foundLatestShopProductsResponse =
      await this.productsService.findLatestShopProducts(shopId);
    return foundLatestShopProductsResponse;
  }

  @Patch(':productId')
  @Roles(Role.SELLER)
  @UseGuards(AuthGuard)
  async updateProductOfShop(
    @Request() req,
    @Param('productId') updateProductId: string,
    @Body() updateProductDto: ProductUpdateDto,
  ): Promise<ProductResponseDto> {
    const userId = req.user.sub;
    const updatedProductResponse =
      await this.productsService.updateShopProductById(
        updateProductId,
        userId,
        updateProductDto,
      );
    return updatedProductResponse;
  }

  @Delete(':productId')
  @UseGuards(AuthGuard)
  @Roles(Role.SELLER)
  async deleteProduct(
    @Request() req,
    @Param('productId') deleteProductId: string,
  ): Promise<ProductResponseDto> {
    const userId = req.user.sub;
    const deletedProductResponse =
      await this.productsService.deleteShopProductById(deleteProductId, userId);
    return deletedProductResponse;
  }
}
