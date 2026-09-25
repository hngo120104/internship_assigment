import { ProductVariantsRepository } from '../repositories/product-variants.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductVariantsService } from './product-variants.service';

jest.mock(
  '../dto/product-variants/request/product-variant-update.request.dto',
  () => ({
    ProductVariantUpdateRequestDto: class ProductVariantUpdateRequestDto {},
  }),
);

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('ProductVariantsService stock reservation', () => {
  let repository: {
    reserveVariantsAmountByVariantIdsAtomically: jest.Mock;
  };
  let service: ProductVariantsService;

  beforeEach(() => {
    repository = {
      reserveVariantsAmountByVariantIdsAtomically: jest.fn(),
    };
    service = new ProductVariantsService(
      repository as unknown as ProductVariantsRepository,
      {} as ProductsRepository,
    );
  });

  it('reserves every requested stock row atomically', async () => {
    repository.reserveVariantsAmountByVariantIdsAtomically.mockResolvedValue(2);

    const result = await service.reserveVariantsAmountAtomicallyOrThrow([
      { variantId: 'variant-b', amount: 1 },
      { variantId: 'variant-a', amount: 2 },
    ]);

    expect(
      repository.reserveVariantsAmountByVariantIdsAtomically,
    ).toHaveBeenCalledWith([
      { variantId: 'variant-a', amount: 2 },
      { variantId: 'variant-b', amount: 1 },
    ]);
    expect(result).toBe(2);
  });

  it('rejects the reservation when not every stock row is updated', async () => {
    repository.reserveVariantsAmountByVariantIdsAtomically.mockResolvedValue(1);

    await expect(
      service.reserveVariantsAmountAtomicallyOrThrow([
        { variantId: 'variant-a', amount: 2 },
        { variantId: 'variant-b', amount: 1 },
      ]),
    ).rejects.toThrow('Atomic database inventory reservation failed.');
  });
});
