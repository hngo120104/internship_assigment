import { Injectable } from '@nestjs/common';
import { ProductCreateRequestDto } from '../dto/products.create.dto';
import { ProductUpdateDto } from '../dto/products.update.dto';

import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepo: ProductsRepository) {}

  createProduct(shopId: number, productCreateDto: ProductCreateRequestDto): Promise<Product | null> {
    return this.productsRepo.createProduct(shopId, productCreateDto);
  }

  findManyLatestProducts(page: number, limit: number): Promise<Product[] | []> {
    return this.productsRepo.findManyLastestProducts(page, limit);
  }

  findLatestShopProducts(shopId: number): Promise<Product[] | null> {
    return this.productsRepo.findLatestShopProducts(shopId);
  }

  findProductById(productId: number): Promise<Product | null> {
    return this.productsRepo.findProductById(productId);
  }

  async updateShopProductById(productId: number, shopId: number, updateProductDto: ProductUpdateDto): Promise<Product | null> {
    return await this.productsRepo.updateShopProductById(productId, shopId, updateProductDto);
  }

  async deleteShopProductById(productId: number, shopId: number): Promise<Product | null> {
    return await this.productsRepo.deleteShopProductById(productId, shopId);
  }
}
