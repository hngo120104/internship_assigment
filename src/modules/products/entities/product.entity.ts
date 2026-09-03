import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Shop } from '../../users/entities/shop.entity';
import { ProductPhoto } from './product.photo.entity';
import { ProductCategories } from './product.categories.entity';
import { ProductVariant } from './product.variant.entity';

@Index('IDX_products_shop_id', ['shopId'])
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

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: boolean;

  @Column({ name: 'search_document', type: 'text', nullable: true })
  searchDocument?: string;

  // Relations
  @ManyToOne(() => Shop, (shop) => shop.products, { onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'shop_id',
    foreignKeyConstraintName: 'FK_products_shop_id',
  })
  shop!: Shop;

  @OneToMany(
    () => ProductCategories,
    (productCategories) => productCategories.product,
  )
  productCategories!: ProductCategories[];

  @OneToMany(() => ProductPhoto, (photo) => photo.product)
  photos!: ProductPhoto[];

  @OneToMany(() => ProductVariant, (productVariant) => productVariant.product)
  variants!: ProductVariant[];
}
