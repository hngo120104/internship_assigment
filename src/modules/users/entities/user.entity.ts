import {
  Entity,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Shop } from './shop.entity';
import { UserPhoto } from './user.photo.entity';
import { Cart } from '../../carts/entities/cart.entity';
import { Address } from './user.address.entity';
import { PrimaryGeneratedBinaryUuidColumn } from '../../../custom.decorators/primary.generated.uuid.binary.column';
import { UserRoles } from './user.roles.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

@Entity('users')
export class User {
  @PrimaryGeneratedBinaryUuidColumn()
  id!: string;

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
  isDeleted!: boolean;

  @Column({
    name: 'user_status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  userStatus!: UserStatus;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
  userRoles!: UserRoles[];

  @OneToMany(() => Address, (address) => address.user)
  addresses!: Address[];

  @OneToOne(() => Shop, (shop) => shop.user, { nullable: true })
  shop?: Shop;

  @OneToMany(() => UserPhoto, (photos) => photos.user)
  photos?: UserPhoto[];

  @OneToMany(() => Cart, (cart) => cart.user)
  cart?: Cart[];
}
