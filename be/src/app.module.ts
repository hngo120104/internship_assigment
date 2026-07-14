import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseService } from './modules/database/database.service';
import { DatabaseModule } from './modules/database/database.module';
import { CartsModule } from './modules/carts/carts.module';
import { ProductsModule } from './modules/products/products.module';
import { RolesGuard } from './modules/auth/guards/role/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/guards/auth/auth.guard';


@Module({
  imports: [OrdersModule, UsersModule, AuthModule, CartsModule, ProductsModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, DatabaseService, {
    provide: APP_GUARD,
    useClass: RolesGuard,
  }, {
    provide: APP_GUARD,
    useClass: AuthGuard,
  }], 
})
export class AppModule {}
