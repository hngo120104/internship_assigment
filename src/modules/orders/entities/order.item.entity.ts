import {
  Check,
  Column,
  Entity,
  JoinColumn,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Order } from './order.entity';

@Entity('order_items')
@Index('UQ_order_items_order_product', ['orderId', 'productId'], {
  unique: true,
})
@Check('CHK_order_items_quantity_positive', '`quantity` > 0')
@Check('CHK_order_items_unit_price_non_negative', '`unit_price` >= 0')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'product_id', type: 'varchar', length: 36 })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName!: string;

  @Column({
    type: 'int',
    default: 1,
  })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'unit_price' })
  unitPrice!: number;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  note?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
