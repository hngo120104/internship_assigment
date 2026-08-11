import { ProductPhoto } from '../entities/product.photo.entity';
import { Injectable } from '@nestjs/common';
import { ProductPhotosInsertDto } from '../dto/product.photos/product.photos.insert.dto';
import { ProductPhotosResponseDto } from '../dto/product.photos/product.photos.response.dto';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { toListResponseDtos } from '../../../utils/to.dto.response';

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

  async findProductPhotosByProductId(
    productId: string,
  ): Promise<ProductPhotosResponseDto[]> {
    const foundPhotos =
      await this.productPhotosRepo.findProductPhotosByProductId(productId);
    return toListResponseDtos(ProductPhotosResponseDto, foundPhotos);
  }
}
