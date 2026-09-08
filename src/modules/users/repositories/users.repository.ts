import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/users/request/user-create.request.dto';
import { User, UserStatus } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async createUser(
    userCreateDto: UserCreateRequestDto,
    hashedPassword: string,
  ): Promise<User> {
    const newUser = this.usersRepository.create({
      userName: userCreateDto.userName,
      email: userCreateDto.email,
      passwordHashed: hashedPassword,
    });
    return this.usersRepository.save(newUser);
  }

  async updateUserPassword(
    user: User,
    newHashedPassword: string,
  ): Promise<User> {
    user.passwordHashed = newHashedPassword;
    return await this.usersRepository.save(user);
  }

  async banUser(userId: string): Promise<User> {
    const bannedUser = await this.usersRepository.update(
      { id: userId, userStatus: UserStatus.ACTIVE, isDeleted: false },
      { userStatus: UserStatus.BANNED },
    );

    if (bannedUser.affected === 0) {
      throw new NotFoundException('User does not exists.');
    }

    return await this.usersRepository.findOneByOrFail({ id: userId });
  }

  findActiveUserById(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId, isDeleted: false, userStatus: UserStatus.ACTIVE },
      relations: { userRoles: { role: true }, shop: true, addresses: true },
    });
  }

  findActiveUserByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email, isDeleted: false, userStatus: UserStatus.ACTIVE },
      relations: { userRoles: { role: true }, shop: true, addresses: true },
    });
  }

  findAllActiveUsers(page: number, size: number): Promise<[User[], number]> {
    return this.usersRepository.findAndCount({
      where: { isDeleted: false, userStatus: UserStatus.ACTIVE },
      relations: {
        userRoles: { role: true },
        photos: true,
        shop: true,
        addresses: true,
      },
      skip: (page - 1) * size,
      take: size,
      order: {
        userName: 'ASC',
      },
    });
  }

  async saveUser(user: User): Promise<User> {
    return await this.usersRepository.save(user);
  }

  async softDeleteUser(userId: string): Promise<boolean> {
    const result = await this.usersRepository.update(
      { id: userId, isDeleted: false },
      { isDeleted: true },
    );

    return result.affected === 1;
  }
}
