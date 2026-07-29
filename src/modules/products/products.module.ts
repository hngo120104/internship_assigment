import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Shop } from '../users/entities/shop.entity';
import { ProductsRepository } from './repositories/products.repository';
import { UsersModule } from '../users/users.module';
import { ProductPhoto } from './entities/product.photo.entity';
import { ProductPhotosService } from './services/product.photos.service';
import { ProductPhotosRepository } from './repositories/product.photo.repository';
import { Category } from '../category/entities/category.entity';
import { CategoriesModule } from '../category/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Shop, ProductPhoto, Category]),
    UsersModule,
    CategoriesModule
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    ProductPhotosService,
    ProductPhotosRepository,
  ],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
