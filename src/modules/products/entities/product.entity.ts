import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Shop } from '../../users/entities/shop.entity';
import { Category } from '../../category/entities/category.entity';
import { CartItem } from '../../carts/entities/cart.item.entity';
import { ProductPhoto } from './product.photo.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id', type: 'varchar', length: 36 })
  shopId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

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

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id',
    },
  })
  categories!: Category[];

  @OneToMany(() => ProductPhoto, (photo) => photo.product)
  photos!: ProductPhoto[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems!: CartItem[];
}
