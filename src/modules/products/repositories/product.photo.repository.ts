import { Repository } from 'typeorm';
import { ProductPhoto } from '../entities/product.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductPhotosInsertRequestDto } from '../dto/product.photos/product.photos.insert.request.dto';

@Injectable()
export class ProductPhotosRepository {
  constructor(
    @InjectRepository(ProductPhoto)
    private readonly ProductPhotosRepo: Repository<ProductPhoto>,
  ) {}

  insertPhotosIntoproduct(
    productId: string,
    ProductPhotosInsertRequestDto: ProductPhotosInsertRequestDto[],
  ): Promise<ProductPhoto[]> {
    const ProductPhotos = ProductPhotosInsertRequestDto.map((ProductPhoto) => ({
      url: ProductPhoto.url,
      description: ProductPhoto.description,
      is_primary: ProductPhoto.is_primary ?? false,
      product_id: productId,
      product: { id: productId },
    }));

    return this.ProductPhotosRepo.save(ProductPhotos);
  }
}
