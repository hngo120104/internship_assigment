import { ProductsRepository } from '../../products/repositories/products.repository';

export class SearchRepository {
  constructor(private readonly productsRepository: ProductsRepository) {}
}
