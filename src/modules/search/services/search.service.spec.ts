import { BadRequestException } from '@nestjs/common';
import { ProductsRepository } from '../../products/repositories/products.repository';
import { ProductSearchSort } from '../../products/enums/product-search-sort.enum';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  let productsRepository: {
    findActiveProductsWithOptionalQueryParams: jest.Mock;
  };

  beforeEach(() => {
    productsRepository = {
      findActiveProductsWithOptionalQueryParams: jest.fn(),
    };
    service = new SearchService(
      productsRepository as unknown as ProductsRepository,
    );
  });

  it('prepares search options and maps raw products into a paginated response', async () => {
    productsRepository.findActiveProductsWithOptionalQueryParams.mockResolvedValue(
      [
        [
          {
            productId: 'product-id',
            productName: 'Điện thoại',
            thumbnail: 'https://example.com/product.jpg',
            minPrice: '125.50',
          },
        ],
        21,
      ],
    );

    const result = await service.findProductsWithOptionalQueryParams({
      page: 2,
      size: 10,
      keyword: '  Điện thoại 123! ',
      minPrice: 100,
      maxPrice: 200,
      categoryIds: ['8ad95aec-7664-4d13-b71b-e3d44811212c'],
      sortOrder: ProductSearchSort.PRICE_DESC,
    });

    expect(
      productsRepository.findActiveProductsWithOptionalQueryParams,
    ).toHaveBeenCalledWith({
      page: 2,
      size: 10,
      searchTerms: {
        rawKeyword: 'điện thoại 123',
        relaxedBooleanKeyword: 'điện* thoại* 123*',
        strictBooleanKeyword: '+điện* +thoại* +123*',
        phraseKeyword: '"điện thoại 123"',
      },
      minPrice: 100,
      maxPrice: 200,
      categoryIds: ['8ad95aec-7664-4d13-b71b-e3d44811212c'],
      orderBy: ProductSearchSort.PRICE_DESC,
    });
    expect(result).toEqual(
      expect.objectContaining({
        page: 2,
        size: 10,
        totalItems: 21,
        totalPages: 3,
      }),
    );
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        productId: 'product-id',
        productName: 'Điện thoại',
        minPrice: 125.5,
      }),
    );
  });

  it('rejects an inverted price range without querying the repository', async () => {
    await expect(
      service.findProductsWithOptionalQueryParams({
        page: 1,
        size: 10,
        minPrice: 200,
        maxPrice: 100,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(
      productsRepository.findActiveProductsWithOptionalQueryParams,
    ).not.toHaveBeenCalled();
  });

  it('omits search terms when no keyword is supplied', async () => {
    productsRepository.findActiveProductsWithOptionalQueryParams.mockResolvedValue(
      [[], 0],
    );

    await service.findProductsWithOptionalQueryParams({ page: 1, size: 10 });

    expect(
      productsRepository.findActiveProductsWithOptionalQueryParams,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ searchTerms: undefined, page: 1, size: 10 }),
    );
  });

  it('omits search terms when the keyword contains only whitespace', async () => {
    productsRepository.findActiveProductsWithOptionalQueryParams.mockResolvedValue(
      [[], 0],
    );

    await service.findProductsWithOptionalQueryParams({
      page: 1,
      size: 10,
      keyword: '   ',
    });

    expect(
      productsRepository.findActiveProductsWithOptionalQueryParams,
    ).toHaveBeenCalledWith(expect.objectContaining({ searchTerms: undefined }));
  });
});
