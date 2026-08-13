import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';

export enum ShopStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_name', unique: true })
  shopName!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  address!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: boolean;

  @Column({
    name: 'shop_status',
    type: 'enum',
    enum: ShopStatus,
    default: ShopStatus.ACTIVE,
  })
  shopStatus!: ShopStatus;

  @OneToOne(() => User, (user) => user.shop, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Product, (product) => product.shop, { cascade: true })
  products?: Product[];

  @OneToMany(() => Order, (order) => order.shop)
  orders!: Order[];
}
