import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { ProductSearchRequestDto } from '../dto/request/product-search.request.dto';
import { ListResponseDto } from '../../../common/dto/list.response.dto';
import { ProductSearchResponseDto } from '../dto/response/product-search.response.dto';
import { toListResponseDtos } from '../../../utils/response-dto.mapper';
import {
  ProductSearchOptions,
  ProductSearchTerms,
} from '../../products/interfaces/product-search-options.interface';

@Injectable()
export class SearchService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  private mapSearchOptionDtoToInterface(
    productSearchDto: ProductSearchRequestDto,
  ): ProductSearchOptions {
    return {
      page: productSearchDto.page,
      size: productSearchDto.size,
      searchTerms: this.buildSearchTerms(productSearchDto.keyword),
      minPrice: productSearchDto.minPrice,
      maxPrice: productSearchDto.maxPrice,
      categoryIds: productSearchDto.categoryIds,
      orderBy: productSearchDto.sortOrder,
    };
  }

  private normalizeKeyword(keyword?: string): string {
    return (keyword ?? '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buildSearchTerms(keyword?: string): ProductSearchTerms | undefined {
    const rawKeyword = this.normalizeKeyword(keyword);
    if (!rawKeyword) return undefined;

    const terms = rawKeyword.split(/\s+/);

    return {
      rawKeyword,
      relaxedBooleanKeyword: terms.map((term) => `${term}*`).join(' '),
      strictBooleanKeyword: terms.map((term) => `+${term}*`).join(' '),
      phraseKeyword: terms.length > 1 ? `"${terms.join(' ')}"` : '',
    };
  }
  private validatePriceRange(minPrice: number, maxPrice: number) {
    if (minPrice > maxPrice) {
      throw new BadRequestException(
        'Min price cannot be bigger than max price',
      );
    }
  }

  async findProductsWithOptionalQueryParams(
    productSearchRequest: ProductSearchRequestDto,
  ): Promise<ListResponseDto<ProductSearchResponseDto>> {
    if (
      productSearchRequest.minPrice !== undefined &&
      productSearchRequest.maxPrice !== undefined
    ) {
      this.validatePriceRange(
        productSearchRequest.minPrice,
        productSearchRequest.maxPrice,
      );
    }
    const productSearchOptions =
      this.mapSearchOptionDtoToInterface(productSearchRequest);
    const [rawProducts, count] =
      await this.productsRepository.findActiveProductsWithOptionalQueryParams(
        productSearchOptions,
      );
    const responses = toListResponseDtos(ProductSearchResponseDto, rawProducts);
    return new ListResponseDto(
      responses,
      count,
      productSearchRequest.page,
      productSearchRequest.size,
    );
  }
}
