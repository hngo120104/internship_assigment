import { ProductPhoto } from '../entities/product.photo.entity';
import { Injectable } from '@nestjs/common';
import { ProductPhotosInsertDto } from '../dto/product.photos/product.photos.insert.dto';
import { ProductPhotosResponseDto } from '../dto/product.photos/product.photos.response.dto';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ProductPhotosService {
  constructor(private readonly productPhotosRepo: ProductPhotosRepository) {}

  async insertPhotosIntoProduct(
    productId: string,
    productPhotosInsertDto: ProductPhotosInsertDto[],
  ): Promise<ProductPhoto[]> {
    const insertedPhotos = await this.productPhotosRepo.insertPhotosIntoProduct(
      productId,
      productPhotosInsertDto,
    );

    return insertedPhotos;
  }

  toProductPhotosInsertResponse(
    productPhotos: ProductPhoto[],
  ): ProductPhotosResponseDto[] {
    return plainToInstance(ProductPhotosResponseDto, productPhotos, {
      excludeExtraneousValues: true,
    });
  }
}
