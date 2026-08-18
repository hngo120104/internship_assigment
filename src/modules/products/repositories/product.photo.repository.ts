import { Repository } from 'typeorm';
import { ProductPhoto } from '../entities/product.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductPhotoInsertRequestDto } from '../dto/product.photos/request/product.photos.insert.request.dto';

@Injectable()
export class ProductPhotosRepository {
  constructor(
    @InjectRepository(ProductPhoto)
    private readonly ProductPhotosRepo: Repository<ProductPhoto>,
  ) {}

  async insertPhotosIntoProduct(
    productId: string,
    productPhotosInsertDto: ProductPhotoInsertRequestDto[],
  ): Promise<ProductPhoto[]> {
    const productPhotos: ProductPhotoInsertRequestDto[] =
      productPhotosInsertDto.map((productPhoto) => ({
        url: productPhoto.url,
        description: productPhoto.description,
        isPrimary: productPhoto.isPrimary ?? false,
        productId: productId,
        product: { id: productId },
      }));

    const createdProductPhotos = this.ProductPhotosRepo.create(productPhotos);

    return await this.ProductPhotosRepo.save(createdProductPhotos);
  }
}
