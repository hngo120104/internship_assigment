import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Shop } from '../users/entities/shop.entity';
import { ProductsRepository } from './repositories/products.repository';
import { UsersModule } from '../users/users.module';
import { ProductPhoto } from './entities/product-photo.entity';
import { ProductPhotosRepository } from './repositories/product-photos.repository';
import { Category } from '../categories/entities/category.entity';
import { CategoriesModule } from '../categories/categories.module';
import { ProductCategory } from './entities/product-category.entity';
import { ProductCategoriesRepository } from './repositories/product-categories.repository';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { ProductVariantsService } from './services/product-variants.service';
import { RedisModule } from '../redis/redis.module';
import { InventoryCachingService } from './services/inventory-caching.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Shop,
      ProductPhoto,
      Category,
      ProductCategory,
      ProductVariant,
    ]),
    UsersModule,
    CategoriesModule,
    RedisModule,
  ],
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepository,
    ProductPhotosRepository,
    ProductCategoriesRepository,
    ProductVariantsRepository,
    ProductVariantsService,
    InventoryCachingService,
  ],
  exports: [
    ProductsService,
    ProductsRepository,
    ProductVariantsService,
    InventoryCachingService,
  ],
})
export class ProductsModule {}
