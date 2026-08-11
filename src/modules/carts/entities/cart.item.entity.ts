import {
  Column,
  Entity,
  JoinColumn,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('cart_items')
@Index('UQ_cart_item_cart_product', ['cartId', 'productId'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'cart_id', type: 'varchar', length: 36 })
  cartId!: string;

  @ManyToOne(() => Cart, (cart) => cart.cartItems, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cart_id' })
  cart!: Cart;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.cartItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity!: number;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
