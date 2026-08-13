import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';
import { ProductPhoto } from '../entities/product.photo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductPhotosInsertRequestDto } from '../dto/product.photos/request/product.photos.insert.request.dto';

@Injectable()
export class ProductPhotosRepository {
  constructor(
    @InjectRepository(ProductPhoto)
    private readonly ProductPhotosRepo: Repository<ProductPhoto>,
  ) {}

  async findOneWithOptions(
    options: FindOneOptions<ProductPhoto>,
  ): Promise<ProductPhoto | null> {
    return await this.ProductPhotosRepo.findOne(options);
  }

  async findManyWithOptions(
    options: FindManyOptions<ProductPhoto>,
  ): Promise<ProductPhoto[]> {
    return await this.ProductPhotosRepo.find(options);
  }

  async findProductPhotosByProductId(
    productId: string,
  ): Promise<ProductPhoto[]> {
    return await this.ProductPhotosRepo.find({
      where: { productId: productId, isDeleted: false },
    });
  }

  async insertPhotosIntoProduct(
    productId: string,
    productPhotosInsertDto: ProductPhotosInsertRequestDto[],
  ): Promise<ProductPhoto[]> {
    const productPhotos = productPhotosInsertDto.map((productPhoto) => ({
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
