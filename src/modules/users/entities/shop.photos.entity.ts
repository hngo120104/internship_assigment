import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shop } from './shop.entity';
import { PhotoType } from './user.photo.entity';

@Entity('shop_photos')
export class ShopPhoto {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'shop_id', type: 'varchar', length: 36 })
  shopId!: string;

  @Column({ type: 'enum', enum: PhotoType })
  type!: PhotoType;

  @Column({ type: 'varchar', length: 2048 })
  url!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: Boolean;

  @ManyToOne(() => Shop, (shop) => shop.photos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'shop_id' })
  shop!: Shop;
}
