import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3307,
  username: process.env.DB_USERNAME || 'hoangngo',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'internship_assignment',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
