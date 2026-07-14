import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/guards/roles/role.decorator';
import { Role } from '../auth/guards/roles/role.enum';
import { AuthGuard } from '../auth/guards/auth/auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(Role.SHOP)  
  @UseGuards(AuthGuard)
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    const shopId = req.user.id;
    return this.productsService.create(shopId, createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

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
    @Body() updateProductDto: UpdateProductDto) {
    const shopId =req.user.id; 
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
