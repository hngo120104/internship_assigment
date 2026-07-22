import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateRequestDto } from '../dto/product.create.dto';
import { ProductUpdateDto } from '../dto/product.update.dto';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  createProduct(
    shopId: number,
    productCreateRequestDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const product = this.productsRepo.create({
      shopId,
      ...productCreateRequestDto,
    });
    return this.productsRepo.save(product);
  }

  findManyLatestProducts(page: number, limit: number): Promise<Product[]> {
    return this.productsRepo.find({
      relations: { shop: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findLatestShopProducts(shopId: number): Promise<Product[]> {
    return this.productsRepo.find({
      where: {
        shopId,
      },
      relations: { shop: true },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  findProductById(productId: number): Promise<Product | null> {
    return this.productsRepo.findOne({
      where: {
        id: productId,
      },
      relations: {
        shop: true,
      },
    });
  }

  async updateShopProductById(
    productId: number,
    shopId: number,
    productUpdateDto: ProductUpdateDto,
  ): Promise<Product> {
    await this.productsRepo
      .createQueryBuilder()
      .update(Product)
      .set(productUpdateDto)
      .where('id = :productId', { productId })
      .andWhere('shop_id = :shopId', { shopId })
      .execute();
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

  async deleteShopProductById(
    productId: number,
    shopId: number,
  ): Promise<Product> {
    const foundProduct = await this.productsRepo.findOne({
      where: {
        id: productId,
        shopId,
      },
    });
    if (!foundProduct) {
      throw new NotFoundException(`Product with id:${productId} not found.`);
    }
    return this.productsRepo.remove(foundProduct);
  }
}
