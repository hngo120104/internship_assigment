import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartItem } from './entities/cart.item.entity';
import { CartsController } from './controllers/carts.controller';
import { CartItemsRepository } from './repositories/cart.items.repository';
import { ProductsModule } from '../products/products.module';
import { CartItemsService } from './services/cart.items.service';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem]), ProductsModule],
  controllers: [CartsController],
  providers: [CartItemsService, CartItemsRepository],
  exports: [CartItemsService],
})
export class CartsModule {}
