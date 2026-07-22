import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateRequestDto } from '../dto/products.create.dto';
import { ProductUpdateDto } from '../dto/products.update.dto';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async createProduct(
    shopId: number,
    productCreateRequestDto: ProductCreateRequestDto,
  ): Promise<Product> {
    const product = this.productsRepo.create({
      shopId,
      ...productCreateRequestDto,
    });
    return await this.productsRepo.save(product);
  }

  async findManyLatestProducts(
    page: number,
    limit: number,
  ): Promise<Product[]> {
    const result = await this.productsRepo.find({
      relations: { shop: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
    return result;
  }

  async findLatestShopProducts(shopId: number): Promise<Product[]> {
    return await this.productsRepo.find({
      where: {
        shopId,
      },
      relations: { shop: true },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findProductById(productId: number): Promise<Product | null> {
    return await this.productsRepo.findOne({
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
    return await this.productsRepo.findOneOrFail({
      where: {
        id: productId,
        shopId,
      },
      relations: {
        shop: true,
      },
    });
  }

  async deleteShopProductById(productId: number, shopId: number): Promise<Product> {
    const foundProduct = await this.productsRepo.findOne({
      where: {
        id: productId,
        shopId,
      }
    })
    if (!foundProduct) {
      throw new NotFoundException(`Prouct with id:${productId} not found.`);
    }
    return await this.productsRepo.remove(foundProduct);
  }
}
