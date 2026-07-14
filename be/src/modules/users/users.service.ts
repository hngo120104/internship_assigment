import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password, email, role } = createUserDto;
    return this.databaseService.query(
      `INSERT INTO users (username, password_hashed, email, role) VALUES (?, ?, ?, ?)`,
      [username, password, email, role],
    );
  }
   
  async findAll() {
    return this.databaseService.query('SELECT , email, role FROM users');
  }

  async findOne(userId: number) {
    return this.databaseService.query(`SELECT * FROM users WHERE id = ?`, [
      userId,
    ]);
  }

  async findByEmail(email: string) {
    return this.databaseService.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.databaseService.query(`UPDATE users SET ? WHERE id = ?`, [
      updateUserDto,
      id,
    ]);
  }

  async remove(userId: number) {
    return this.databaseService.query(
      `
      DELETE FROM users WHERE id = ?`,
      [userId],
    );
  }
}
