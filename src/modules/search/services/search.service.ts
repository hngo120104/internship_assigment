import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { ProductsSearchRequestDto } from '../dto/request/products.search.request';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { ProductsSearchResponseDto } from '../dto/response/products.search.response.dto';
import { toListResponseDtos } from '../../../utils/to.dto.response';

@Injectable()
export class SearchService {
  constructor(private readonly productsRepo: ProductsRepository) {}

  private formatSearchQuery(query: string | undefined): string {
    if (!query) return '';
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => `+${word}*`)
      .join(' ');
  }

  private validatePriceRange(minPrice: number, maxPrice: number) {
    if (minPrice > maxPrice) {
      throw new BadRequestException(
        'Min price cannot be bigger than max price',
      );
    }
  }

  async findProductsWithOptionalQueryParams(
    query: ProductsSearchRequestDto,
  ): Promise<ListResponseDto<ProductsSearchResponseDto>> {
    const formattedKeyword = this.formatSearchQuery(query.keyword);

    if (query.minPrice !== undefined && query.maxPrice !== undefined) {
      this.validatePriceRange(query.minPrice, query.maxPrice);
    }
    const [rawProducts, count] =
      await this.productsRepo.findActiveProductsWithOptionalQueryParams(
        query.page,
        query.size,
        formattedKeyword,
        query.minPrice,
        query.maxPrice,
        query.categoryIds,
        query.sortOrder,
      );
    console.log('raw products:\n', rawProducts);
    const responses = toListResponseDtos(
      ProductsSearchResponseDto,
      rawProducts,
    );
    return new ListResponseDto(responses, count, query.page, query.size);
  }
}
