import { Module } from '@nestjs/common';
import { CheckoutsService } from './services/checkout.service';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { RedisModule } from '../redis/redis.module';
import { CheckoutController } from './controllers/checkout.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkout } from './entities/checkout.entity';
import { CheckoutRepository } from './repositories/checkout.repository';
import { CartsModule } from '../carts/carts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Checkout]),
    OrdersModule,
    ProductsModule,
    CartsModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutsService, CheckoutRepository],
  exports: [],
})
export class CheckoutsModule {}
