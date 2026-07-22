import { AuthService } from './auth.service';
import { UsersRepository } from '../users/repositories/users.repositories';
import { JwtService } from '@nestjs/jwt';
import { Role } from './guards/role/role.enum';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/services/users.service';

describe('AuthService.register', () => {
  let service: AuthService;
  let usersRepository: Pick<UsersRepository, 'checkEmailExist' | 'createUser'>;
  let jwtService: Pick<JwtService, 'sign'>;

  beforeEach(() => {
    usersRepository = {
      checkEmailExist: jest.fn(),
      createUser: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('token'),
    };

    service = new AuthService(
      usersRepository as UsersRepository,
      jwtService as JwtService,
    );
  });

  it('hashes the password before creating a user and returns a token', async () => {
    (usersRepository.checkEmailExist as jest.Mock).mockResolvedValue(false);
    (usersRepository.createUser as jest.Mock).mockImplementation(
      async (dto: any) => ({
        id: 1,
        role: Role.CUSTOMER,
        ...dto,
      }),
    );

    const result = await service.register({
      username: 'alice',
      email: 'alice@example.com',
      password: 'Password123',
      role: Role.CUSTOMER,
    } as any);

    const createdUserPayload = (usersRepository.createUser as jest.Mock).mock
      .calls[0][0];
    expect(createdUserPayload.password).not.toBe('Password123');
    expect(
      await bcrypt.compare('Password123', createdUserPayload.password),
    ).toBe(true);
    expect(result).toEqual({ access_token: 'token' });
  });
});
