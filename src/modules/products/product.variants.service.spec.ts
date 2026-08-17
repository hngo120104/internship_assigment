import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductSize } from './enum/product.size.enum';
import { ProductVariantsRepository } from './repositories/product.variants.repository';
import { ProductsRepository } from './repositories/products.repository';
import { ProductVariantsService } from './services/product.variants.service';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('ProductVariantsService', () => {
  let service: ProductVariantsService;
  let variantsRepo: {
    findProductById: jest.Mock;
    findActiveById: jest.Mock;
    findAllProductVariantByProductId: jest.Mock;
    createVariants: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
    findVariantByIdAndLock: jest.Mock;
    findActiveByIdAndLock: jest.Mock;
  };
  let productsRepo: { findProductById: jest.Mock };

  beforeEach(async () => {
    variantsRepo = {
      findProductById: jest.fn(),
      findActiveById: jest.fn(),
      findAllProductVariantByProductId: jest.fn(),
      createVariants: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      findVariantByIdAndLock: jest.fn(),
      findActiveByIdAndLock: jest.fn(),
    };
    productsRepo = { findProductById: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantsService,
        { provide: ProductVariantsRepository, useValue: variantsRepo },
        { provide: ProductsRepository, useValue: productsRepo },
      ],
    }).compile();

    service = module.get(ProductVariantsService);
  });

  it('creates multiple variants explicitly for one product', async () => {
    const input = [
      {
        size: ProductSize.M,
        color: 'Black',
        amount: 10,
        price: 100,
        isActive: true,
      },
      {
        size: ProductSize.L,
        color: 'Black',
        amount: 5,
        price: 110,
        isActive: true,
      },
    ];
    productsRepo.findProductById.mockResolvedValue({ id: 'product-id' });
    variantsRepo.findAllProductVariantByProductId.mockResolvedValue([]);
    variantsRepo.createVariants.mockResolvedValue(input);

    await expect(
      service.createProductVariants('product-id', input),
    ).resolves.toEqual(input);
    expect(variantsRepo.createVariants).toHaveBeenCalledWith(
      'product-id',
      input,
    );
  });

  it('rejects duplicate definitions in the create request', async () => {
    productsRepo.findProductById.mockResolvedValue({ id: 'product-id' });
    const duplicateInput = [
      {
        size: ProductSize.M,
        color: ' Black ',
        amount: 10,
        price: 100,
        isActive: true,
      },
      {
        size: ProductSize.M,
        color: 'black',
        amount: 5,
        price: 110,
        isActive: true,
      },
    ];

    await expect(
      service.createProductVariants('product-id', duplicateInput),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(variantsRepo.createVariants).not.toHaveBeenCalled();
  });

  it('updates a variant after validating its definition', async () => {
    const variant = {
      id: 'variant-id',
      productId: 'product-id',
      size: ProductSize.M,
      color: 'Black',
      amount: 10,
      price: 100,
      isActive: true,
    };
    variantsRepo.findProductById.mockResolvedValue(variant);
    variantsRepo.findAllProductVariantByProductId.mockResolvedValue([variant]);
    variantsRepo.save.mockImplementation((value) => Promise.resolve(value));

    const result = await service.updateProductVariant('variant-id', {
      color: ' White ',
      price: 120,
    });

    expect(result.color).toBe('White');
    expect(result.price).toBe(120);
    expect(variantsRepo.save).toHaveBeenCalledWith(variant);
  });

  it('soft-deletes and deactivates an existing variant', async () => {
    variantsRepo.findProductById.mockResolvedValue({ id: 'variant-id' });
    variantsRepo.softDelete.mockResolvedValue(1);

    await expect(
      service.softDeleteProductVariantOrThrow('variant-id'),
    ).resolves.toBe(1);
    expect(variantsRepo.softDelete).toHaveBeenCalledWith('variant-id');
  });

  it('rejects invalid quantity and insufficient stock', async () => {
    variantsRepo.findActiveById.mockResolvedValue({ amount: 2 });

    await expect(
      service.validateVariantQuantity('variant-id', 0),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.validateVariantQuantity('variant-id', 3),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when a variant does not exist', async () => {
    variantsRepo.findProductById.mockResolvedValue(null);
    await expect(
      service.softDeleteProductVariantOrThrow('missing-id'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
