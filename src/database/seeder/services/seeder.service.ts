import { Repository } from 'typeorm';
import { Role } from '../../../modules/users/entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../modules/users/entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SeederService {
  private customerRole!: Role;
  private sellerRole!: Role;
  private adminRole!: Role;

  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async run() {
    await this.seedRoles();
    await this.seedUsers();
  }

  async seedRoles() {
    const customerRole = {
      name: 'CUSTOMER',
      description: 'Customer role',
    };
    const sellerRole = {
      name: 'SELLER',
      description: 'Seller role',
    };
    const adminRole = {
      name: 'ADMIN',
      description: 'Admin role',
    };
    this.customerRole = this.rolesRepository.create(customerRole);
    this.sellerRole = this.rolesRepository.create(sellerRole);
    this.adminRole = this.rolesRepository.create(adminRole);
    await this.rolesRepository.save([
      this.customerRole,
      this.sellerRole,
      this.adminRole,
    ]);
  }

  async seedUsers() {
    // const admin = this.usersRepository.create({
    //   userName: 'ADMIN',
    //   email: 'Admin@gmail.com',
    //   passwordHashed: await bcrypt.hash('Admin0!!!', 12),
    //   userRoles: [this.adminRole],
    //   addresses: [
    //     {
    //       recipientName: 'Hoang',
    //       phoneNumber: '1112223334',
    //       province: 'Ha Noi',
    //       district: 'Cau Giay',
    //       addressLine: 'IDMC Building, 18 Tôn Thất Thuyết',
    //       isPrimary: true,
    //       isDeleted: false,
    //     },
    //   ],
    //   isDeleted: false,
    // });
    // const user1 = this.usersRepository.create({
    //   userName: 'user01',
    //   email: 'User01@gmail.com',
    //   passwordHashed: await bcrypt.hash('User01!!!', 12),
    //   roles: [this.customerRole],
    //   addresses: [
    //     {
    //       recipientName: 'Hoang',
    //       phoneNumber: '1112223334',
    //       province: 'Ha Noi',
    //       district: 'Cau Giay',
    //       addressLine: 'IDMC Building, 18 Tôn Thất Thuyết',
    //       isPrimary: true,
    //       isDeleted: false,
    //     },
    //   ],
    //   isDeleted: false,
    // });
    // await this.usersRepository.save([user1, admin]);
  }
}
