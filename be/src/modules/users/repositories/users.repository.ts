import { Injectable } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { take } from 'rxjs';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {
    super(userRepo.target, userRepo.manager, userRepo.queryRunner)
  }

  async createUser(
    userCreateRequestDto: UserCreateRequestDto,
  ): Promise<User> {
    const newUser = this.create(userCreateRequestDto);
    return await this.userRepo.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOneBy({ email });
  }

  async checkEmailExist(email: string): Promise<boolean> {
    return this.existsBy({ email });
  }

  async findMany(pagination: number): Promise<User[]> {
    return await this.find(
      { relations: {photos: true }, take: pagination }
    )
  }
}
