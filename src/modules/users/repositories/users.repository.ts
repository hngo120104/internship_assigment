import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/users/user.create.request.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Transactional } from '@nestjs-cls/transactional';
import { RolesRepository } from './role.repository';
import { Role } from '../entities/role.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly roleRepo: RolesRepository,
  ) {}

  async createUser(
    userCreateRequestDto: UserCreateRequestDto,
    defaultRole: Role,
    passwordHashed: string,
  ): Promise<User> {
    const newUser = this.userRepo.create({
      userName: userCreateRequestDto.userName,
      email: userCreateRequestDto.email,
      passwordHashed: passwordHashed,
      roles: [defaultRole],
    });

    return this.userRepo.save(newUser);
  }

  // async getPasswordHashedByUserEmail(email: string): Promise<string | null> {
  //   const result = await this.userRepo
  //     .createQueryBuilder('users')
  //     .select('users.password_hashed', 'password_hashed')
  //     .where('user.email = :email', { email })
  //     .getRawOne<string>();
  //   const passwordHashed = result ?? null;
  //   return passwordHashed;
  // }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const updateResult = await this.userRepo.update(userId, updateData);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User does not exist.`);
    }

    return await this.userRepo.findOneByOrFail({ id: userId });
  }

  findActiveUserById(userId: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id: userId, isDeleted: false },
      relations: { roles: true, shop: true },
    });
  }

  findActiveUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: email, isDeleted: false },
      relations: { roles: true, shop: true },
    });
  }

  findManyActiveUsers(page: number, limit: number): Promise<User[]> {
    return this.userRepo.find({
      where: { isDeleted: false },
      relations: { photos: true, shop: true },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        userName: 'ASC',
      },
    });
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepo.save(user);
  }

  async softDeleteUser(userId: string): Promise<User> {
    const result = await this.userRepo.update(
      { id: userId, isDeleted: false },
      { isDeleted: true },
    );

    if (result.affected === 0) {
      throw new NotFoundException('User does not exist or is already deleted.');
    }

    return this.userRepo.findOneByOrFail({ id: userId });
  }
}
