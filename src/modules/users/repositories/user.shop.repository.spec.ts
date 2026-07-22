import { UserShopRepository } from './user.shop.repository';
import { Shop } from '../entities/shop.entity';

describe('UserShopRepository', () => {
  it('saves the shop with its owning user relation', async () => {
    const user = { id: 7 } as any;
    const shop = { id: 3, shopName: 'Test Shop', user } as Shop;
    const create = jest.fn().mockReturnValue(shop);
    const save = jest.fn().mockResolvedValue(shop);
    const repository = new UserShopRepository({ create, save } as any);

    const result = await repository.createShop(user, {
      shopName: 'Test Shop',
      description: 'Description',
      address: 'Address',
    });

    expect(create).toHaveBeenCalledWith({
      user,
      shopName: 'Test Shop',
      description: 'Description',
      address: 'Address',
    });
    expect(save).toHaveBeenCalledWith(shop);
    expect(result).toBe(shop);
  });
});
