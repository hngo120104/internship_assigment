import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { UuidBinaryTransformer } from '../../transformer/uuid.binary.transformer';
import { BinaryUuidColumn } from '../../../custom.decorators/primary.generated.uuid.binary.column';
import { ProductCategories } from '../../products/entities/product.categories.entity';

@Entity('categories')
export class Category {
  @PrimaryColumn({
    type: 'binary',
    length: 16,
    transformer: UuidBinaryTransformer,
  })
  id!: string;

  @Column({ name: 'icon_url', type: 'varchar', length: 2048, nullable: true })
  iconUrl!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @BinaryUuidColumn('parent_id')
  parentId!: string;

  @Column({ name: 'is_active', type: 'tinyint', default: 1 })
  isActive!: boolean;

  // Self Reference Relations
  @ManyToOne(() => Category, (category) => category.children, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @OneToMany(
    () => ProductCategories,
    (productCategories) => productCategories.category,
  )
  productCategories!: ProductCategories[];
}
