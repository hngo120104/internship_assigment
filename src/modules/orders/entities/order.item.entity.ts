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
  Unique,
} from 'typeorm';
import { ProductVariant } from '../../products/entities/product.variant.entity';
import { ProductSize } from '../../products/enum/product.size.enum';
import { Order } from './order.entity';

@Entity('order_items')
@Unique('UQ_order_items_order_variant', ['orderId', 'variantId'])
@Index('IDX_order_items_order_id', ['orderId'])
@Index('IDX_order_items_variant_id', ['variantId'])
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

  @Column({ name: 'variant_id', type: 'varchar', length: 36 })
  variantId!: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.orderItems, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'variant_id',
    foreignKeyConstraintName: 'FK_order_items_variant_id',
  })
  variant!: ProductVariant;

  @Column({ name: 'product_name', type: 'varchar', length: 255 })
  productName!: string;

  @Column({
    name: 'variant_size',
    type: 'enum',
    enum: ProductSize,
    nullable: true,
  })
  variantSize?: ProductSize;

  @Column({
    name: 'variant_color',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  variantColor?: string;

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
