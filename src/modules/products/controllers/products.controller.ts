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
import { ProductCreateRequestDto } from '../dto/product.create.dto';
import { ProductUpdateDto } from '../dto/product.update.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { AuthGuard } from '../../auth/guards/auth/auth.guard';
import { Public } from '../../auth/public.decorator';
import { ProductResponseDto } from '../dto/product.response.dto';
import { plainToInstance } from 'class-transformer';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('new-product')
  @Roles(Role.SHOP)
  @UseGuards(AuthGuard)
  async createProducts(
    @Request() req,
    @Body() productCreateDto: ProductCreateRequestDto,
  ): Promise<ProductResponseDto> {
    const shopId = req.user.shopId;
    console.log(shopId)
    const newProduct = await this.productsService.createProduct(shopId, productCreateDto);
    return plainToInstance(ProductResponseDto, newProduct,
      {
        excludeExtraneousValues: true
      }
    )
  }

  @Public()
  @Get()
  async findMany(): Promise<ProductResponseDto[]> {
    const foundProducts = await this.productsService.findLatestProducts(
      1,
      20,
    );
    return plainToInstance(ProductResponseDto, foundProducts, {
      excludeExtraneousValues: true,
    });
  }

  @Public()
  @Get(':shopId')
  async findByShop(@Param('shopId') shopId: string): Promise<ProductResponseDto[]> {
    const foundLatestShopProducts = await this.productsService.findLatestShopProducts(+shopId);
    return plainToInstance(ProductResponseDto, foundLatestShopProducts, {
      excludeExtraneousValues: true
    })
  }

  @Patch(':id')
  @Roles(Role.SHOP)
  @UseGuards(AuthGuard)
  update(
    @Request() req,
    @Param('id') updateProductId: string,
    @Body() updateProductDto: ProductUpdateDto,
  ) {
    const shopId = req.user.sub;
    return this.productsService.updateShopProductById(
      +updateProductId,
      +shopId,
      updateProductDto,
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.SHOP)
  deleteProductOfShop(@Request() req, @Param('id') deleteProductId: string) {
    const shopId = req.user.sub;
    return this.productsService.deleteShopProductById(
      +deleteProductId,
      +shopId,
    );
  }
}
