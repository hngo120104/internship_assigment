import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(shopId: number,createProductDto: CreateProductDto) {
    const { name, description, price, stock, status } = createProductDto;
    return this.databaseService.query(`
      INSERT INTO products (shop_id, name, description, price, stock, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [shopId, name, description, price, stock, status]
    );
  }

  async findAll() {
    return this.databaseService.query('SELECT * FROM products WHERE status = "available"');
  }

  async findOne(id: number) {
    return this.databaseService.query(
      `SELECT * FROM products WHERE id = ?`, [id]
    );
  }

  async update(id: number, shopId: number, updateProductDto: UpdateProductDto) {
    const { name, description, price, stock, status } = updateProductDto;
    return this.databaseService.query(`
      UPDATE products SET name = ?, description = ?, price = ?, stock = ?, status = ? WHERE id = ? AND shop_id = ? AND status = "available"`,
    [id, name, description, price, stock, status, shopId])
  }

  async remove(id: number, shopId: number) {
    return this.databaseService.query(`DELETE FROM products WHERE id = ? AND shop_id = ?`, [id, shopId]);
  }
}
