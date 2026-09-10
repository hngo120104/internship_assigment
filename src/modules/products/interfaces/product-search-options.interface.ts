import { Pagination } from '../../../common/interfaces/pagination.interface';
import { ProductSearchSort } from '../enums/product-search-sort.enum';

export interface ProductSearchTerms {
  rawKeyword: string;
  relaxedBooleanKeyword: string;
  strictBooleanKeyword: string;
  phraseKeyword: string;
}

export interface ProductSearchOptions extends Pagination {
  minPrice?: number;
  maxPrice?: number;
  searchTerms?: ProductSearchTerms;
  categoryIds?: string[];
  orderBy?: ProductSearchSort;
}
