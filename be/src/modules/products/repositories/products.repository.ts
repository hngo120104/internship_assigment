import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { ProductCreaterequestDto } from '../dto/products.create.dto';

export class ProductsRepository extends Repository<Product> {
  constructor(
    @InjectRepository(Product) private readonly productsRepo: Repository<Product>,
  ) {
    super(productsRepo.target, productsRepo.manager, productsRepo.queryRunner);
  }

  async createProduct(shopId: number,
    productCreateRequestDto: ProductCreaterequestDto,
  ): Promise<Product | null> {
    const product = this.productsRepo.create({
      shopId,
      ...productCreateRequestDto
    }); 
    return await this.productsRepo.save(product);
  }

  async findMany(pagination: number): Promise<Product[] | []> {
    return await this.find({
      relations: { shop: true },
      take: pagination
    });
  }
}
