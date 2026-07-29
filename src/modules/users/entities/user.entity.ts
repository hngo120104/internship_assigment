import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Shop } from './shop.entity';
import { UserPhoto } from './user.photo.entity';
import { Cart } from '../../carts/entities/cart.entity';
import { Address } from './user.address.entity';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id!: string;

  @Column({ name: 'user_name', type: 'varchar', length: 255 })
  userName!: string;

  @Column({ unique: true, type: 'varchar', length: 255 }) email!: string;

  @Column({ name: 'password_hashed', type: 'varchar', length: 255 })
  passwordHashed!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: Boolean;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles!: Role[];

  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  @OneToOne(() => Shop, (shop) => shop.user, { nullable: true })
  shop!: Shop;

  @OneToMany(() => UserPhoto, (photos) => photos.user)
  photos?: UserPhoto[];

  @OneToMany(() => Cart, (cart) => cart.user)
  cart!: Cart[];
}
