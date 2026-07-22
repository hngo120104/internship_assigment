import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Shop } from '../users/entities/shop.entity';
import { User } from '../users/entities/user.entity';
import { UserPhoto } from '../users/entities/photo.entity';
import { ProductsRepository } from './repositories/products.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User, Shop, UserPhoto])],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
