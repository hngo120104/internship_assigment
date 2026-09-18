import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Shop } from '../../users/entities/shop.entity';
import { OrderItem } from './order-item.entity';
import { Checkout } from '../../checkouts/entities/checkout.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

@Index('IDX_orders_shop_id', ['shopId'])
@Unique('UQ_order_code', ['orderCode'])
@Check('CHK_orders_discount_non_negative', '`discount` >= 0')
@Check('CHK_orders_shipping_fee_non_negative', '`shipping_fee` >= 0')
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id', type: 'varchar', length: 36 })
  shopId!: string;

  //TODO: change to not null after seeding
  @Column({ name: 'checkout_id', type: 'varchar', length: 36 })
  checkoutId!: string;

  @Column({
    name: 'order_code',
    length: 36,
    type: 'varchar',
  })
  orderCode?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount!: number;

  @Column({
    name: 'shipping_fee',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingFee!: number;

  @ManyToOne(() => Shop, (shop) => shop.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_orders_shop_id',
  })
  shop!: Shop;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems!: OrderItem[];

  @ManyToOne(() => Checkout, (checkout) => checkout.orders)
  @JoinColumn({
    name: 'checkout_id',
    foreignKeyConstraintName: 'FK_orders_checkout_id',
  })
  checkout!: Checkout;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
