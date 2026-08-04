import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UuidBinaryTransformer } from '../../transformer/uuid.binary.transformer';
import { Product } from './product.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('product_categories')
export class ProductCategories {
  @PrimaryColumn({
    name: 'product_id',
    type: 'binary',
    length: 16,
    transformer: UuidBinaryTransformer,
  })
  productId!: string;

  @ManyToOne(() => Product, (product) => product.productCategories)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product!: Product;

  @PrimaryColumn({
    name: 'category_id',
    type: 'binary',
    length: 16,
    transformer: UuidBinaryTransformer,
  })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.productCategories)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category!: Category;
}
