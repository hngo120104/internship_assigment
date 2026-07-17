import { Injectable } from '@nestjs/common';
import { ProductCreaterequestDto } from '../dto/products.create.dto';
import { UpdateProductDto } from '../dto/products.update.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductsRepository } from '../repositories/products.repository';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private readonly productsRepo: ProductsRepository) {}

  async createProduct(shopId: number, productCreateDto: ProductCreaterequestDto): Promise<Product | null> {
    return await this.productsRepo.createProduct(shopId, productCreateDto);
  }

  async findMany(pagination: number): Promise<Product[] | []> {
    return await this.productsRepo.findMany(pagination);
  }

  async findOne(id: number) {

  }

  async update(id: number, shopId: number, updateProductDto: UpdateProductDto) {
    

  }

  async remove(id: number, shopId: number) {

  }
}
