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

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn() id!: number;
  @Column() name!: string;
  @Column() type!: string;
  @Column({ nullable: true }) description!: string;
  @Column() stock!: number;
  @Column() price!: number;
  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt?: Date;
  @Column({ name: 'shop_id' }) shopId!: number;
  @JoinColumn({ name: 'shop_id' })
  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: 'CASCADE' })
  shop!: Shop;
}
