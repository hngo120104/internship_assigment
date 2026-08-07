import { In, Repository } from 'typeorm';
import { ProductPhoto } from '../entities/product.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductPhotosInsertDto } from '../dto/product.photos/product.photos.insert.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductPhotosRepository {
  constructor(
    @InjectRepository(ProductPhoto)
    private readonly ProductPhotosRepo: Repository<ProductPhoto>,
  ) {}

  async findProductPhotos(productId: string): Promise<ProductPhoto[]> {
    return await this.ProductPhotosRepo.find({
      where: { productId: productId, isDeleted: false },
    });
  }

  async insertPhotosIntoProduct(
    productId: string,
    productPhotosInsertDto: ProductPhotosInsertDto[],
  ): Promise<ProductPhoto[]> {
    const productPhotos = productPhotosInsertDto.map((productPhoto) => ({
      id: randomUUID(),
      url: productPhoto.url,
      description: productPhoto.description,
      isPrimary: productPhoto.isPrimary ?? false,
      productId: productId,
      product: { id: productId },
    }));

    const createdProductPhotos = this.ProductPhotosRepo.create(productPhotos);

    return await this.ProductPhotosRepo.save(createdProductPhotos);
  }

  async softDeleteProductPhotos(
    productId: string,
    photoIds: string[],
  ): Promise<boolean> {
    const result = await this.ProductPhotosRepo.update(
      {
        productId: productId,
        id: In(photoIds),
        isDeleted: false,
      },
      { isDeleted: true },
    );
    return result.affected !== 0;
  }
}
