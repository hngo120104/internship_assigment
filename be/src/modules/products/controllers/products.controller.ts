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
import { ProductCreateRequestDto } from '../dto/products.create.dto';
import { ProductUpdateDto } from '../dto/products.update.dto';
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
  createProducts(@Request() req, @Body() productCreateDto: ProductCreateRequestDto) {
    const shopId = req.user.sub;
    return this.productsService.createProduct(shopId, productCreateDto);
  }

  @Public()
  @Get()
  async findMany(): Promise<ProductResponseDto[]> {
    const foundProducts = await this.productsService.findManyLatestProducts(1, 20);
    return plainToInstance(ProductResponseDto, foundProducts, {
      excludeExtraneousValues: true
    })
  }

  @Public()
  @Get(':shopId')
  async findOne(@Param('id') id: string) {
    return this.productsService.findLatestShopProducts(+id);
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
    return this.productsService.updateShopProductById(+updateProductId, +shopId, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.SHOP)
  deleteProductOfShop(@Request() req, @Param('id') deleteProductId: string) {
    const shopId = req.user.sub;
    return this.productsService.deleteShopProductById(+deleteProductId, +shopId);
  }
}
