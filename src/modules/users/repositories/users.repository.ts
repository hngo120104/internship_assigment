import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../../auth/guards/role/role.enum';

@Injectable()
export class UsersRepository {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async createUser(
    userCreateRequestDto: UserCreateRequestDto,
    passwordHashed: string,
  ): Promise<User> {
    const newUser = this.userRepo.create({
      username: userCreateRequestDto.username,
      email: userCreateRequestDto.email,
      passwordHashed: passwordHashed,
      role: Role.CUSTOMER,
    });
    return this.userRepo.save(newUser);
  }

  findById(userId: number): Promise<User | null> {
    return this.userRepo.findOne({
      where: { id: userId },
      relations: { shop: true }
    });
  }

  findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({
      where: { email: email },
      relations: { shop: true }
    });
  }

  findMany(pagination: number): Promise<User[]> {
    return this.userRepo.find({
      relations: { photos: true },
      take: pagination,
    });
  }

  // async deleteUserById(userId: number): Promise<User> {
  //   const foundUser = await this.userRepo.findOneBy({
  //     id: userId,
  //   });
  //   if (!foundUser) {
  //     throw new NotFoundException(`User with id:${userId} not found.`);
  //   }
  //   return await this.userRepo.remove(foundUser);
  // }

  async save(user: User): Promise<User> {
    return await this.userRepo.save(user);
  }
}
