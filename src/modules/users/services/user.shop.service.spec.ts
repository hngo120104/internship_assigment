import { Role } from '../../auth/guards/role/role.enum';
import { UserShopService } from './user.shop.service';
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional';

initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });

describe('UserShopService', () => {
  it('persists the SHOP role before creating the associated shop', async () => {
    const user = { id: 7, role: Role.CUSTOMER, shop: null } as any;
    const shop = { id: 3, shopName: 'Test Shop', user } as any;
    const calls: string[] = [];
    const userShopRepo = {
      createShop: jest.fn().mockImplementation(async () => {
        calls.push('createShop');
        return shop;
      }),
    };
    const usersRepo = {
      findById: jest.fn().mockResolvedValue(user),
      save: jest.fn().mockImplementation(async () => {
        calls.push('saveUser');
        return user;
      }),
    };
    const service = new UserShopService(userShopRepo as any, usersRepo as any);

    const result = await service.createShop(7, { shopName: 'Test Shop' });

    expect(user.role).toBe(Role.SHOP);
    expect(usersRepo.save).toHaveBeenCalledWith(user);
    expect(userShopRepo.createShop).toHaveBeenCalledWith(user, {
      shopName: 'Test Shop',
    });
    expect(calls).toEqual(['saveUser', 'createShop']);
    expect(result).toBe(shop);
  });
});
