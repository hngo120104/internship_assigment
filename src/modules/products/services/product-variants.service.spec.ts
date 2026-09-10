import { NotFoundException } from '@nestjs/common';
import { ProductVariant } from '../entities/product-variant.entity';
import { ProductVariantsRepository } from '../repositories/product-variants.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductVariantsService } from './product-variants.service';
import { ShopsService } from '../../users/services/shops.service';
import { ShopsRepository } from '../../users/repositories/shops.repository';

describe('ProductVariantsService stock reservation', () => {
  let repository: {
    reserveVariantsAmountByVariantIdsAtomically: jest.Mock;
    findActiveVariantsByIds: jest.Mock;
  };
  let service: ProductVariantsService;

  const variants = [
    { id: 'variant-a', amount: 5 },
    { id: 'variant-b', amount: 3 },
  ] as ProductVariant[];

  beforeEach(() => {
    repository = {
      reserveVariantsAmountByVariantIdsAtomically: jest.fn(),
      findActiveVariantsByIds: jest.fn(),
    };
    service = new ProductVariantsService(
      {} as ShopsService,
      repository as unknown as ProductVariantsRepository,
      {} as ProductsRepository,
      {} as ShopsRepository,
    );
    jest.spyOn(service, 'validateVariantQuantity').mockResolvedValue();
  });

  it('returns refreshed variants when every requested stock row is updated', async () => {
    repository.reserveVariantsAmountByVariantIdsAtomically.mockResolvedValue(2);
    repository.findActiveVariantsByIds.mockResolvedValue(variants);

    const result = await service.validateAndReserveVariantsAmountOrThrow([
      { variant: variants[0], quantity: 2 },
      { variant: variants[1], quantity: 1 },
    ]);

    expect(
      repository.reserveVariantsAmountByVariantIdsAtomically,
    ).toHaveBeenCalledWith([
      { variantId: 'variant-a', quantity: 2 },
      { variantId: 'variant-b', quantity: 1 },
    ]);
    expect(repository.findActiveVariantsByIds).toHaveBeenCalledWith([
      'variant-a',
      'variant-b',
    ]);
    expect(result).toBe(variants);
  });

  it('rejects the reservation when not every stock row is updated', async () => {
    repository.reserveVariantsAmountByVariantIdsAtomically.mockResolvedValue(1);

    await expect(
      service.validateAndReserveVariantsAmountOrThrow([
        { variant: variants[0], quantity: 2 },
        { variant: variants[1], quantity: 1 },
      ]),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repository.findActiveVariantsByIds).not.toHaveBeenCalled();
  });
});
