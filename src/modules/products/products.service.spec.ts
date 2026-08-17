import { Test, TestingModule } from '@nestjs/testing';
import { UserShopService } from '../users/services/user.shop.service';
import { ProductCategoriesRepository } from './repositories/product.categories.repository';
import { ProductPhotosRepository } from './repositories/product.photo.repository';
import { ProductsRepository } from './repositories/products.repository';
import { ProductVariantsService } from './services/product.variants.service';
import { ProductsService } from './services/products.service';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
}));

describe('ProductsService', () => {
  it('creates product variants explicitly during product creation', async () => {
    const productsRepo = {
      createProduct: jest.fn().mockResolvedValue({
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
    const categoriesRepo = {
      saveProductCategories: jest.fn().mockResolvedValue([]),
    };
    const photosRepo = {
      insertPhotosIntoProduct: jest.fn().mockResolvedValue([]),
    };
    const userShopService = {
      findShopByUserIdOrThrow: jest.fn().mockResolvedValue({ id: 'shop-id' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: productsRepo },
        { provide: ProductVariantsService, useValue: variantsService },
        { provide: ProductCategoriesRepository, useValue: categoriesRepo },
        { provide: ProductPhotosRepository, useValue: photosRepo },
        { provide: UserShopService, useValue: userShopService },
      ],
    }).compile();
    const service = module.get(ProductsService);
    const variants = [
      { amount: 5, price: 100, isActive: true, color: 'Black' },
    ];

    const result = await service.createProduct('user-id', {
      name: 'Product name',
      categoryIds: [],
      photos: [],
      variants,
      isActive: true,
    });

    expect(variantsService.createProductVariants).toHaveBeenCalledWith(
      'product-id',
      variants,
    );
    expect(result.variants).toEqual([
      expect.objectContaining({ id: 'variant-id', price: 100, amount: 5 }),
    ]);
  });
});
