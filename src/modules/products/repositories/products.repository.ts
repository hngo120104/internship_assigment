import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ProductCreateDto } from '../dto/products/product.create.dto';
import { ProductUpdateDto } from '../dto/products/product.update.dto';
import { Injectable } from '@nestjs/common';
import { Shop } from '../../users/entities/shop.entity';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepo: Repository<Product>,
  ) {}

  async findOneWithOptions(
    options: FindOneOptions<Product>,
  ): Promise<Product | null> {
    return await this.productsRepo.findOne(options);
  }

  async findManyWithOptions(
    options: FindManyOptions<Product>,
  ): Promise<Product[]> {
    return await this.productsRepo.find(options);
  }

  async findProductByIdAndLock(productId: string): Promise<Product | null> {
    return await this.productsRepo
      .createQueryBuilder()
      .setLock('pessimistic_write')
      .leftJoinAndSelect('products.shop', 'shop')
      .where('products.id = :productId', { productId })
      .andWhere('products.isActive = :isActive', { isActive: true })
      .andWhere('products.isDeleted = :isDeleted', { isDeleted: false })
      .getOne();
  }

  async findActiveShopByProductId(
    productId: string,
  ): Promise<Shop | null | undefined> {
    const foundProduct = await this.productsRepo.findOne({
      where: { id: productId, isActive: true, isDeleted: false },
      relations: { shop: true },
    });
    return foundProduct?.shop;
  }

  async createProduct(
    shopId: string,
    productCreateDto: ProductCreateDto,
  ): Promise<Product> {
    const product = this.productsRepo.create({
      shop: { id: shopId },
      ...productCreateDto,
    });
    return this.productsRepo.save(product);
  }

  async saveProduct(product: Product): Promise<Product> {
    return await this.productsRepo.save(product);
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
  ): Promise<boolean> {
    const updateResult = await this.productsRepo.update(
      { id: productId, shopId, isDeleted: false },
      productUpdateDto,
    );
    return updateResult.affected === 1;
  }

  async softDeleteShopProductById(
    productId: string,
    shopId: string,
  ): Promise<number> {
    const deletedProduct = await this.productsRepo.update(
      { shopId: shopId, id: productId, isDeleted: false },
      { isDeleted: true },
    );
    return deletedProduct.affected ?? 0;
  }
}
