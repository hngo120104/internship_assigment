import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Shop } from '../../users/entities/shop.entity';
import { ProductStatus } from '../enum/product.enum';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn() id!: number;
  @Column() name!: string;
  @Column() type!: string;
  @Column({ nullable: true }) description!: string;
  @Column() stock!: number;
  @Column() price!: number;
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.AVAILABLE,
  })
  productStatus!: ProductStatus;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt?: Date;
  @JoinColumn({ name: 'shop_id' }) shopId!: number;
  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: 'CASCADE' })
  shop!: Shop;
}
