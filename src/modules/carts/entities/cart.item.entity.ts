import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProductVariant } from '../../products/entities/product.variant.entity';

export enum CartItemStatus {
  ACTIVE = 'ACTIVE',
  ORDERED = 'ORDERED',
  EXPIRED = 'EXPIRED',
}

@Check('CHK_cart_items_quantity_non_negative', '`quantity` > 0')
@Index('IDX_cart_items_user_id', ['userId'])
@Index('IDX_cart_items_variant_id', ['variantId'])
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'variant_id', type: 'varchar', length: 36 })
  variantId!: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.cartItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'FK_cart_items_variant',
  })
  variant!: ProductVariant;

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
