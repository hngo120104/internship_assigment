import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user-create-request.dto';
import { UserUpdateDto } from '../dto/user-update.dto';
import { DatabaseService } from '../../database/database.service';
import { UserResponseDto } from '../dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { Photo } from '../entities/photo.entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

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
}
