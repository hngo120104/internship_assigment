import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum CartItemStatus {
  ACTIVE = 'ACTIVE',
  ORDERED = 'ORDERED',
  EXPIRED = 'EXPIRED',
}

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({
    name: 'cart_item_status',
    type: 'enum',
    enum: CartItemStatus,
    default: CartItemStatus.ACTIVE,
  })
  cartItemStatus!: CartItemStatus;

  @Column({
    type: 'integer',
  })
  quantity!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: boolean;
}
