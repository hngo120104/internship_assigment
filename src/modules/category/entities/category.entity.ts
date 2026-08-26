import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProductCategories } from '../../products/entities/product.categories.entity';

@Unique('categories_name', ['name'])
@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 2048, nullable: true })
  iconUrl!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true })
  parentId?: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive!: boolean;

  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'parent_id',
    foreignKeyConstraintName: 'FK_categories_parent_id',
  })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @OneToMany(
    () => ProductCategories,
    (productCategories) => productCategories.category,
  )
  productCategories!: ProductCategories[];
}
