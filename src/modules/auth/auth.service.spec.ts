import { Role } from './guards/role/role.enum';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('keeps the user id as JWT subject after shop registration', async () => {
    const usersService = {
      findById: jest.fn().mockResolvedValue({ id: 7 }),
    };
    const userShopService = {
      createShop: jest.fn().mockResolvedValue({ id: 23 }),
    };
    const jwtService = {
      sign: jest.fn().mockReturnValue('token'),
    };
    const service = new AuthService(
      usersService as any,
      userShopService as any,
      jwtService as any,
    );

    const result = await service.shopRegister(7, { shopName: 'Test Shop' });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 7,
      role: Role.SHOP,
    });
    expect(result).toEqual({ access_token: 'token' });
  });
});
