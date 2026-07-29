import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreateRequestDto } from '../dto/products/product.create.dto';
import { ProductUpdateDto } from '../dto/products/product.update.dto';
import { NotFoundException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { UserShopRepository } from '../../users/repositories/user.shop.repository';
import { Category } from '../../category/entities/category.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,

  ) {}


  async createProduct(
    shopId: string,
    productCreateRequestDto: ProductCreateRequestDto,
    categories: Category[],
  ): Promise<Product> {
    const product = this.productsRepo.create({
      shop: { id: shopId },
      ...productCreateRequestDto,
      categories: categories
    });
    return this.productsRepo.save(product);
  }

  findManyLatestProducts(page: number, limit: number): Promise<Product[]> {
    return this.productsRepo.find({
      where: { isActive: true },
      relations: { shop: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findLatestShopProducts(shopId: string): Promise<Product[]> {
    return this.productsRepo.find({
      where: {
        isActive: true,
        shopId: shopId,
      },
      relations: { shop: true },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findProductById(productId: string): Promise<Product> {
    const foundProduct = await this.productsRepo.findOne({
      where: {
        id: productId,
      },
      relations: {
        shop: true,
      },
    });
    if (!foundProduct) {
      throw new NotFoundException('Product does not exist.');
    }
    return foundProduct;
  }

  async updateShopProductById(
    productId: string,
    shopId: string,
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
