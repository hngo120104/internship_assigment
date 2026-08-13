import { ProductPhoto } from '../entities/product.photo.entity';
import { Injectable } from '@nestjs/common';
import { ProductPhotosInsertRequestDto } from '../dto/product.photos/request/product.photos.insert.request.dto';
import { ProductPhotosResponseDto } from '../dto/product.photos/response/product.photos.response.dto';
import { ProductPhotosRepository } from '../repositories/product.photo.repository';
import { toListResponseDtos } from '../../../utils/to.dto.response';

@Injectable()
export class ProductPhotosService {
  constructor(private readonly productPhotosRepo: ProductPhotosRepository) {}

  async insertPhotosIntoProduct(
    productId: string,
    productPhotosInsertDto: ProductPhotosInsertRequestDto[],
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
