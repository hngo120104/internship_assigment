import { Repository } from 'typeorm';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantsRepository } from './product-variants.repository';

describe('ProductVariantsRepository stock reservation', () => {
  let typeOrmRepository: { query: jest.Mock };
  let repository: ProductVariantsRepository;

  beforeEach(() => {
    typeOrmRepository = { query: jest.fn() };
    repository = new ProductVariantsRepository(
      typeOrmRepository as unknown as Repository<ProductVariant>,
    );
  });

  it('returns the MySQL affectedRows count for a successful batch update', async () => {
    typeOrmRepository.query.mockResolvedValue({ affectedRows: 2 });

    const affected =
      await repository.reserveVariantsAmountByVariantIdsAtomically([
        { variantId: 'variant-a', quantity: 2 },
        { variantId: 'variant-b', quantity: 1 },
      ]);

    expect(affected).toBe(2);
    expect(typeOrmRepository.query).toHaveBeenCalledTimes(1);

    const [sql, parameters] = typeOrmRepository.query.mock.calls[0] as [
      string,
      unknown[],
    ];
    expect(sql).toContain(
      'CASE WHEN id = ? THEN amount - ? WHEN id = ? THEN amount - ?',
    );
    expect(sql).toContain(
      '(id = ? AND amount >= ?) OR (id = ? AND amount >= ?)',
    );
    expect(parameters).toEqual([
      'variant-a',
      2,
      'variant-b',
      1,
      ['variant-a', 'variant-b'],
      'variant-a',
      2,
      'variant-b',
      1,
    ]);
  });

  it('returns zero without issuing invalid SQL for an empty batch', async () => {
    const affected =
      await repository.reserveVariantsAmountByVariantIdsAtomically([]);

    expect(affected).toBe(0);
    expect(typeOrmRepository.query).not.toHaveBeenCalled();
  });
});
