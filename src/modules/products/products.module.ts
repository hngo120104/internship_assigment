import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Shop } from '../users/entities/shop.entity';
import { ProductsRepository } from './repositories/products.repository';
import { UsersModule } from '../users/users.module';
import { ProductPhoto } from './entities/product.photo.entity';
import { ProductPhotosRepository } from './repositories/product.photo.repository';
import { Category } from '../category/entities/category.entity';
import { CategoriesModule } from '../category/categories.module';
import { ProductCategories } from './entities/product.categories.entity';
import { ProductCategoriesRepository } from './repositories/product.categories.repository';
import { ProductVariant } from './entities/product.variant.entity';
import { ProductVariantsRepository } from './repositories/product.variants.repository';
import { ProductVariantsService } from './services/product.variants.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Shop,
      ProductPhoto,
      Category,
      ProductCategories,
      ProductVariant,
    ]),
    UsersModule,
    CategoriesModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    ProductPhotosRepository,
    ProductCategoriesRepository,
    ProductVariantsRepository,
    ProductVariantsService,
  ],
  exports: [ProductsService, ProductsRepository, ProductVariantsService],
})
export class ProductsModule {}
