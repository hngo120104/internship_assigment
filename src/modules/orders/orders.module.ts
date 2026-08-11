import { Module } from '@nestjs/common';
import { OrdersService } from './services/orders.service';
import { OrdersController } from './controllers/orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order.item.entity';
import { ProductsModule } from '../products/products.module';
import { OrdersRepository } from './repositories/orders.repository';
import { OrderItemsRepository } from './repositories/order.items.repository';
import { UsersModule } from '../users/users.module';
import { CartsModule } from '../carts/carts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
    UsersModule,
    CartsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository, OrderItemsRepository],
  exports: [],
})
export class OrdersModule {}
