import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Category } from '../../categories/entities/category.entity';

@Index('IDX_product_categories_category_id', ['categoryId'])
@Entity('product_categories')
export class ProductCategory {
  @PrimaryColumn({
    name: 'product_id',
    type: 'varchar',
    length: 36,
    nullable: false,
  })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.productCategories)
  @JoinColumn({
    name: 'product_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_product_categories_product_id',
  })
  product!: Product;

  @PrimaryColumn({
    name: 'category_id',
    type: 'varchar',
    length: 36,
    nullable: false,
  })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.productCategories)
  @JoinColumn({
    name: 'category_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_product_categories_category_id',
  })
  category!: Category;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: boolean;
}
