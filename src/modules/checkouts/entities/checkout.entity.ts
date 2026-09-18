import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Order } from '../../orders/entities/order.entity';
import { CheckoutStatus } from '../enums/checkout-status.enum';
import { UserAddress } from '../../users/entities/user-address.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

@Unique('UQ_checkouts_idempotency_key_user_id', ['userId', 'idempotencyKey'])
@Entity('checkouts')
export class Checkout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'varchar',
    length: 36,
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.checkouts, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_checkouts_user_id',
  })
  user!: User;

  @Column({
    type: 'enum',
    enum: CheckoutStatus,
    default: CheckoutStatus.PROCESSING,
  })
  status!: CheckoutStatus;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 36 })
  idempotencyKey!: string;

  @Column({ name: 'shipping_address_id', type: 'varchar', length: 36 })
  shippingAddressId!: string;

  @ManyToOne(() => UserAddress, (address) => address.checkouts, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'shipping_address_id',
    foreignKeyConstraintName: 'FK_checkouts_shipping_address_id',
  })
  shippingAddress!: UserAddress;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus!: PaymentStatus;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.COD,
  })
  paymentMethod!: PaymentMethod;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @OneToMany(() => Order, (order) => order.checkout, {
    onDelete: 'RESTRICT',
    cascade: ['insert'],
  })
  orders!: Order[];
}
