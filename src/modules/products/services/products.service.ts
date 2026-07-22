import { Injectable } from '@nestjs/common';
import { ProductCreateRequestDto } from '../dto/product.create.dto';
import { ProductUpdateDto } from '../dto/product.update.dto';

import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepo: ProductsRepository) {}

  createProduct(
    shopId: number,
    productCreateDto: ProductCreateRequestDto,
  ): Promise<Product | null> {
    return this.productsRepo.createProduct(shopId, productCreateDto);
  }

  findLatestProducts(page: number, limit: number): Promise<Product[]> {
    return this.productsRepo.findManyLatestProducts(page, limit);
  }

  findLatestShopProducts(shopId: number): Promise<Product[]> {
    return this.productsRepo.findLatestShopProducts(shopId);
  }

  findProductById(productId: number): Promise<Product | null> {
    return this.productsRepo.findProductById(productId);
  }

  updateShopProductById(
    productId: number,
    shopId: number,
    updateProductDto: ProductUpdateDto,
  ): Promise<Product> {
    return this.productsRepo.updateShopProductById(
      productId,
      shopId,
      updateProductDto,
    );
  }

  deleteShopProductById(
    productId: number,
    shopId: number,
  ): Promise<Product> {
    return this.productsRepo.deleteShopProductById(productId, shopId);
  }
}
