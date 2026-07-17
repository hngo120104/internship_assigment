import { Injectable } from '@nestjs/common';
import { UserCreateRequestDto } from '../dto/user.create.request.dto';
import { User } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { take } from 'rxjs';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>
  ) {
    super(userRepo.target, userRepo.manager, userRepo.queryRunner);
  }

  async createUser(userCreateRequestDto: UserCreateRequestDto, transactionManager?: EntityManager): Promise<User> {
    const userRepo = transactionManager? transactionManager.getRepository(User) : this.userRepo;
    const newUser = this.create(userCreateRequestDto);
    return await userRepo.save(newUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.findOneBy({ email });
  }

  async findMany(pagination: number): Promise<User[] | []> {
    return await this.find({ relations: { photos: true }, take: pagination });
  }
}
