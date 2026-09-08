import { Test, TestingModule } from '@nestjs/testing';
import { ShopsService } from '../../users/services/shops.service';
import { ProductCategoriesRepository } from '../repositories/product-categories.repository';
import { ProductPhotosRepository } from '../repositories/product-photos.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductVariantsService } from './product-variants.service';
import { ProductsService } from './products.service';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('ProductsService', () => {
  it('creates product variants explicitly during product creation', async () => {
    const productsRepository = {
      createProductOrThrow: jest.fn().mockResolvedValue({
        id: 'product-id',
        shopId: 'shop-id',
        name: 'Product name',
        isActive: true,
      }),
    };
    const variantsService = {
      createProductVariants: jest
        .fn()
        .mockResolvedValue([{ id: 'variant-id', price: 100, amount: 5 }]),
    };
    const categoriesRepository = {
      saveProductCategories: jest.fn().mockResolvedValue([]),
    };
    const photosRepository = {
      insertPhotosIntoProduct: jest.fn().mockResolvedValue([]),
    };
    const shopsService = {
      findShopByUserIdOrThrow: jest.fn().mockResolvedValue({ id: 'shop-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: productsRepository },
        { provide: ProductVariantsService, useValue: variantsService },
        {
          provide: ProductCategoriesRepository,
          useValue: categoriesRepository,
        },
        { provide: ProductPhotosRepository, useValue: photosRepository },
        { provide: ShopsService, useValue: shopsService },
      ],
    }).compile();
    const service = module.get(ProductsService);
    const variants = [
      {
        variantName: 'Black variant',
        amount: 5,
        price: 100,
        isActive: true,
        color: 'Black',
      },
    ];

    const result = await service.createProductOrThrow('user-id', {
      name: 'Product name',
      categoryIds: [],
      photos: [],
      variants,
      isActive: true,
    });

    expect(variantsService.createProductVariants).toHaveBeenCalledWith(
      'user-id',
      'product-id',
      variants,
    );
    expect(result.variants).toEqual([
      expect.objectContaining({ id: 'variant-id', price: 100, amount: 5 }),
    ]);
  });
});
