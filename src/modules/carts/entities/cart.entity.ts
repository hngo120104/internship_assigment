import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartItem } from './cart.item.entity';
import { User } from '../../users/entities/user.entity';

export enum CartStatus {
  ACTIVE = 'ACTIVE',
  ORDERED = 'ORDERED',
  EXPIRED = 'EXPIRED',
}

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'guest_id',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  guestId?: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.cart, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({
    name: 'cart_status',
    type: 'enum',
    enum: CartStatus,
    default: CartStatus.ACTIVE,
  })
  cartStatus!: CartStatus;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart, { cascade: true })
  cartItems?: CartItem[];

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: boolean;
}
