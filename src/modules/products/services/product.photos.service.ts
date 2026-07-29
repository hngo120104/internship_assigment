import { ProductPhoto } from "../entities/product.photo.entity";
import { Injectable } from "@nestjs/common";
import { ProductPhotosInsertRequestDto } from "../dto/product.photos/product.photos.insert.request.dto";
import { ProductPhotosResponseDto } from "../dto/product.photos/product.photos.response.dto";
import { ProductPhotosRepository } from "../repositories/product.photo.repository";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ProductPhotosService {
    constructor(
        private readonly productPhotosRepo: ProductPhotosRepository
    ) {}

    async insertPhotosIntoProduct(productId: string, productPhotosInsertRequestDto: ProductPhotosInsertRequestDto[]): Promise<ProductPhoto[]> {
        const insertedPhotos = await this.productPhotosRepo.insertPhotosIntoproduct(productId, productPhotosInsertRequestDto);

        return insertedPhotos;
    }

    toProductPhotosInsertResponse(productPhotos: ProductPhoto[]): ProductPhotosResponseDto[] {
        return plainToInstance(ProductPhotosResponseDto, productPhotos, {
            excludeExtraneousValues: true
        })
    }
}