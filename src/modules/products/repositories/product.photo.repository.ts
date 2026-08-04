import { Repository } from 'typeorm';
import { ProductPhoto } from '../entities/product.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductPhotosInsertRequestDto } from '../dto/product.photos/product.photos.insert.request.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductPhotosRepository {
  constructor(
    @InjectRepository(ProductPhoto)
    private readonly ProductPhotosRepo: Repository<ProductPhoto>,
  ) {}

  async insertPhotosIntoProduct(
    productId: string,
    ProductPhotosInsertRequestDto: ProductPhotosInsertRequestDto[],
  ): Promise<ProductPhoto[]> {
    const productPhotos = ProductPhotosInsertRequestDto.map((ProductPhoto) => ({
      id: randomUUID(),
      url: ProductPhoto.url,
      description: ProductPhoto.description,
      isPrimary: ProductPhoto.isPrimary ?? false,
      productId: productId,
      product: { id: productId },
    }));

    const createdProductPhotos = this.ProductPhotosRepo.create(productPhotos);

    return await this.ProductPhotosRepo.save(createdProductPhotos);
  }
}
