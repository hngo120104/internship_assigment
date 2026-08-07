import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Shop } from '../../users/entities/shop.entity';
import { CartItem } from '../../carts/entities/cart.item.entity';
import { ProductPhoto } from './product.photo.entity';
import {
  BinaryUuidColumn,
  PrimaryGeneratedBinaryUuidColumn,
} from '../../../custom.decorators/primary.generated.uuid.binary.column';
import { ProductCategories } from './product.categories.entity';
import { OrderItem } from '../../orders/entities/order.item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedBinaryUuidColumn()
  id!: string;

  @BinaryUuidColumn('shop_id')
  shopId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

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

  // Relations
  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shop_id' })
  shop!: Shop;

  @OneToMany(
    () => ProductCategories,
    (productCategories) => productCategories.product,
  )
  productCategories!: ProductCategories[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems!: OrderItem[];

  @OneToMany(() => ProductPhoto, (photo) => photo.product)
  photos!: ProductPhoto[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems!: CartItem[];
}
