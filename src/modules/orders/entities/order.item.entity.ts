import {
  Check,
  Column,
  Entity,
  JoinColumn,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import {
  BinaryUuidColumn,
  PrimaryGeneratedBinaryUuidColumn,
} from '../../../custom.decorators/primary.generated.uuid.binary.column';
import { Order } from './order.entity';

@Entity('order_items')
@Index('UQ_order_items_order_product', ['orderId', 'productId'], {
  unique: true,
})
@Check('CHK_order_items_quantity_positive', '`quantity` > 0')
@Check('CHK_order_items_unit_price_non_negative', '`unit_price` >= 0')
export class OrderItem {
  @PrimaryGeneratedBinaryUuidColumn()
  id!: string;

  @BinaryUuidColumn('order_id')
  orderId!: string;

  @ManyToOne(() => Order, (order) => order.orderItems)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @BinaryUuidColumn('product_id')
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

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;
}
