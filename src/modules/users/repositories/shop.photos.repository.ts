import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ShopPhoto } from '../entities/shop.photos.entity';

@Injectable()
export class ShopPhotosRepository {
  constructor(
    @InjectRepository(ShopPhoto)
    private readonly shopPhotosRepo: Repository<ShopPhoto>,
  ) {}

  async findOneWithOptions(
    options: FindOneOptions<ShopPhoto>,
  ): Promise<ShopPhoto | null> {
    return await this.shopPhotosRepo.findOne(options);
  }

  async findManyWithOptions(
    options: FindManyOptions<ShopPhoto>,
  ): Promise<ShopPhoto[]> {
    return await this.shopPhotosRepo.find(options);
  }
}
