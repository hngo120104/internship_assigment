import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/users/user.create.request.dto';
import { User, UserStatus } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async createUser(
    userCreateRequestDto: UserCreateRequestDto,
    passwordHashed: string,
  ): Promise<User> {
    const newUser = this.userRepo.create({
      id: randomUUID(),
      userName: userCreateRequestDto.userName,
      email: userCreateRequestDto.email,
      passwordHashed: passwordHashed,
    });
    return this.userRepo.save(newUser);
  }

  async updateUserPassword(
    user: User,
    newPasswordHashed: string,
  ): Promise<User> {
    user.passwordHashed = newPasswordHashed;
    return await this.userRepo.save(user);
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const updateResult = await this.userRepo.update(userId, updateData);

    if (updateResult.affected === 0) {
      throw new NotFoundException(`User does not exist.`);
    }

    return await this.userRepo.findOneByOrFail({ id: userId });
  }

  async banUser(userId: string): Promise<User> {
    const bannedUser = await this.userRepo.update(
      { id: userId, userStatus: UserStatus.ACTIVE },
      { userStatus: UserStatus.BANNED },
    );

    if (bannedUser.affected === 0) {
      throw new NotFoundException('User does not exists.');
    }

    return await this.userRepo.findOneByOrFail({ id: userId });
  }

  findActiveUserById(userId: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id: userId, isDeleted: false, userStatus: UserStatus.ACTIVE },
      relations: { userRoles: { role: true }, shop: true },
    });
  }

  findActiveUserByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email: email, isDeleted: false, userStatus: UserStatus.ACTIVE },
      relations: { userRoles: { role: true }, shop: true },
    });
  }

  findManyActiveUsers(page: number, limit: number): Promise<User[]> {
    return this.userRepo.find({
      where: { isDeleted: false, userStatus: UserStatus.ACTIVE },
      relations: { userRoles: { role: true }, photos: true, shop: true },
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
