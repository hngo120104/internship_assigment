import { Pagination } from '../../../common/interfaces/pagination.interface';
import { ProductSearchSort } from '../enums/product-search-sort.enum';

export interface ProductSearchOptions extends Pagination {
  minPrice?: number;
  maxPrice?: number;
  formattedKeyword?: string;
  categoryIds?: string[];
  orderBy?: ProductSearchSort;
}
