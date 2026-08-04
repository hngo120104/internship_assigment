import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../users/entities/shop.entity';
import { CartItem } from './entities/cart.item.entity';
import { CartsService } from './services/carts.service';
import { CartsController } from './controllers/carts.controller';
import { CartItemsRepository } from './repositories/cart.items.repository';
import { CartsRepository } from './repositories/carts.repository';
import { Cart } from './entities/cart.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Cart, Product]),
    ProductsModule,
  ],
  controllers: [CartsController],
  providers: [CartsService, CartsRepository, CartItemsRepository],
  // exports: [CartsService, CartItemsRepository]
})
export class CartsModule {}
