import { Module } from '@nestjs/common';
import { SearchService } from './services/search.service';
import { SearchController } from './controllers/search.controller';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
