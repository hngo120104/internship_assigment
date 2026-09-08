import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductSearchSort } from '../../../products/enums/product-search-sort.enum';
import { ProductSearchRequestDto } from './product-search.request.dto';

describe('ProductSearchRequestDto', () => {
  const categoryId1 = '8ad95aec-7664-4d13-b71b-e3d44811212c';
  const categoryId2 = 'bc4b7c71-4f7a-46f7-93c7-fbf738ff247d';

  async function transformAndValidate(input: Record<string, unknown>) {
    const dto = plainToInstance(ProductSearchRequestDto, input);
    const errors = await validate(dto);
    return { dto, errors };
  }

  it('normalizes one category ID into an array', async () => {
    const { dto, errors } = await transformAndValidate({
      page: '1',
      size: '10',
      categoryIds: categoryId1,
    });

    expect(errors).toHaveLength(0);
    expect(dto.categoryIds).toEqual([categoryId1]);
  });

  it('supports comma-separated category IDs', async () => {
    const { dto, errors } = await transformAndValidate({
      page: '1',
      size: '10',
      categoryIds: `${categoryId1}, ${categoryId2}`,
    });

    expect(errors).toHaveLength(0);
    expect(dto.categoryIds).toEqual([categoryId1, categoryId2]);
  });

  it('preserves repeated query parameters parsed as an array', async () => {
    const { dto, errors } = await transformAndValidate({
      page: '1',
      size: '10',
      categoryIds: [categoryId1, categoryId2],
    });

    expect(errors).toHaveLength(0);
    expect(dto.categoryIds).toEqual([categoryId1, categoryId2]);
  });

  it('transforms aliased numeric and sorting parameters', async () => {
    const { dto, errors } = await transformAndValidate({
      page: '2',
      size: '20',
      min_price: '10.5',
      max_price: '99.5',
      sort_order: ProductSearchSort.PRICE_ASC,
    });

    expect(errors).toHaveLength(0);
    expect(dto).toEqual(
      expect.objectContaining({
        page: 2,
        size: 20,
        minPrice: 10.5,
        maxPrice: 99.5,
        sortOrder: ProductSearchSort.PRICE_ASC,
      }),
    );
  });

  it('rejects invalid category IDs', async () => {
    const { errors } = await transformAndValidate({
      page: '1',
      size: '10',
      categoryIds: 'not-a-uuid',
    });

    expect(errors.some((error) => error.property === 'categoryIds')).toBe(true);
  });
});
