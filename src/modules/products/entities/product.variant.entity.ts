import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
  Index,
  OneToMany,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { CartItem } from '../../carts/entities/cart.item.entity';
import { OrderItem } from '../../orders/entities/order.item.entity';
import { ProductSize } from '../enum/product.size.enum';

@Index('IDX_product_variants_product_id', ['productId'])
@Unique(['productId', 'size', 'color'])
@Check('CHK_product_variants_amount_non_negative', '`amount` >= 0')
@Check('CHK_product_variants_price_non_negative', '`price` >= 0')
@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @Column({ type: 'enum', enum: ProductSize, nullable: true })
  size?: ProductSize;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color?: string;

  @Column({ type: 'int', default: 0 })
  amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: boolean;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'product_id',
    foreignKeyConstraintName: 'FK_product_variants_product',
  })
  product!: Product;

  @OneToMany(() => CartItem, (cartItem) => cartItem.variant)
  cartItems!: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.variant)
  orderItems!: OrderItem[];
}
