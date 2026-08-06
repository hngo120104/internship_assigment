import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateRequestDto } from '../dto/products/product.create.dto';
import { ProductUpdateDto } from '../dto/products/product.update.dto';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async createProduct(
    shopId: string,
    productCreateRequestDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const product = this.productsRepo.create({
      id: randomUUID(),
      shop: { id: shopId },
      ...productCreateRequestDto,
    });
    return this.productsRepo.save(product);
  }

  findManyLatestActiveProducts(
    page: number,
    limit: number,
  ): Promise<Product[]> {
    return this.productsRepo.find({
      where: { isActive: true, isDeleted: false },
      relations: {
        shop: true,
        photos: true,
        productCategories: { category: true },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findLatestActiveShopProducts(shopId: string): Promise<Product[]> {
    return this.productsRepo.find({
      where: {
        isActive: true,
        isDeleted: false,
        shopId: shopId,
      },
      relations: {
        shop: true,
        photos: true,
        productCategories: { category: true },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findActiveProductById(productId: string): Promise<Product | null> {
    const foundProduct = await this.productsRepo.findOne({
      where: {
        id: productId,
        isActive: true,
        isDeleted: false,
      },
      relations: {
        shop: true,
        photos: true,
        productCategories: {
          category: true,
        },
      },
    });
    return foundProduct;
  }

  async updateShopProductById(
    productId: string,
    shopId: string,
    productUpdateDto: ProductUpdateDto,
  ): Promise<Product> {
    await this.productsRepo.update({ id: productId }, productUpdateDto);

    return this.productsRepo.findOneOrFail({
      where: {
        id: productId,
        shopId,
      },
      relations: {
        shop: true,
      },
    });
  }

  async softDeleteShopProductById(
    productId: string,
    shopId: string,
  ): Promise<Product> {
    const deletedProduct = await this.productsRepo.update(
      { shopId: shopId, id: productId, isDeleted: false },
      { isDeleted: true },
    );
    if (deletedProduct.affected === 0) {
      throw new NotFoundException(
        'Product does not exist or is already deleted.',
      );
    }
    return this.productsRepo.findOneByOrFail({ id: productId });
  }
}
