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
import { ProductCreaterequestDto } from '../dto/products.create.dto';
import { UpdateProductDto } from '../dto/products.update.dto';
import { Roles } from '../../auth/guards/role/role.decorator';
import { Role } from '../../auth/guards/role/role.enum';
import { AuthGuard } from '../../auth/guards/auth/auth.guard';
import { Public } from '../../auth/public.decorator';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('new-product')
  @Roles(Role.SHOP) 
  @UseGuards(AuthGuard)
  createProducts(@Request() req, @Body() productCreateDto: ProductCreaterequestDto) {
    const shopId = req.user.id;
    return this.productsService.createProduct(shopId, productCreateDto);
  }

  @Public()
  @Get()
  findMany() {
    return this.productsService.findMany(20);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.SHOP)
  @UseGuards(AuthGuard)
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const shopId = req.user.id;
    return this.productsService.update(+id, +shopId, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(Role.SHOP)
  remove(@Request() req, @Param('id') id: string) {
    const shopId = req.user.id;
    return this.productsService.remove(+id, +shopId);
  }
}
