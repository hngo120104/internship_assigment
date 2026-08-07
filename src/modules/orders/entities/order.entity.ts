import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  BinaryUuidColumn,
  PrimaryGeneratedBinaryUuidColumn,
} from '../../../custom.decorators/primary.generated.uuid.binary.column';
import { Shop } from '../../users/entities/shop.entity';
import { OrderItem } from './order.item.entity';
import { Address } from '../../users/entities/user.address.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Index('IDX_orders_shop_id', ['shopId'])
@Check('CHK_orders_discount_non_negative', '`discount` >= 0')
@Check('CHK_orders_shipping_fee_non_negative', '`shipping_fee` >= 0')
@Entity('orders')
export class Order {
  @PrimaryGeneratedBinaryUuidColumn()
  id!: string;

  @BinaryUuidColumn('user_id')
  userId!: string;

  @BinaryUuidColumn('shop_id')
  shopId!: string;

  @BinaryUuidColumn('recipient_address_id')
  shipAddressId!: string;

  @Column({
    name: 'order_code',
    unique: true,
    length: 36,
    default: () => '(UUID())',
  })
  orderCode!: string;

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

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Shop, (shop) => shop.orders, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shop_id' })
  shop!: Shop;

  @Column({
    name: 'order_status',
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  orderStatus!: OrderStatus;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems!: OrderItem[];

  @ManyToOne(() => Address, (address) => address.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'recipient_address_id' })
  shipAddress!: Address;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  note?: string;
}
