import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/entities/product.entity';
import { CartItem } from './entities/cart.item.entity';
import { CartsService } from './services/carts.service';
import { CartsController } from './controllers/carts.controller';
import { CartItemsRepository } from './repositories/cart.items.repository';
import { CartsRepository } from './repositories/carts.repository';
import { Cart } from './entities/cart.entity';
import { ProductsModule } from '../products/products.module';
import { CartItemsService } from './services/cart.items.service';
import { CartItemsController } from './controllers/cart.items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItem, Cart, Product]),
    ProductsModule,
  ],
  controllers: [CartsController, CartItemsController],
  providers: [
    CartsService,
    CartItemsService,
    CartsRepository,
    CartItemsRepository,
  ],
  exports: [CartsService, CartItemsRepository],
})
export class CartsModule {}
