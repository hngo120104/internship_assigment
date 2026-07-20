import { Injectable, NotFoundException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { User } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {
    super(userRepo.target, userRepo.manager, userRepo.queryRunner);
  }

  async createUser(
    userCreateRequestDto: UserCreateRequestDto, passwordHashed: string
  ): Promise<User> {
    const newUser = this.create({
      username: userCreateRequestDto.username,
      email: userCreateRequestDto.email,
      passwordHashed: passwordHashed,
      role: userCreateRequestDto.role
    });
    return await this.userRepo.save(newUser);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.findOneBy({ email });
  }

  findMany(pagination: number): Promise<User[] | []> {
    return this.find({ relations: { photos: true }, take: pagination });
  }

  async deleteUserById(userId: number): Promise<User | null> {
    const foundUser = await this.userRepo.findOneBy({
        id: userId
    })
    if (!foundUser) {
      throw new NotFoundException(`User with id:${userId} not found.`);
    }
    return await this.userRepo.remove(foundUser);
  }
}
