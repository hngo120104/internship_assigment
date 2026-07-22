import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Shop } from './shop.entity';
import { Role } from '../../auth/guards/role/role.enum';
import { UserPhoto } from './photo.entities';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn() id!: number;
  @Column() username!: string;
  @Column({ unique: true }) email!: string;
  @Column({ select: true }) passwordHashed!: string;
  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role!: Role;
  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Shop, (shop) => shop.user, { nullable: true, cascade: true }) shop!: Shop;
  @OneToMany(() => UserPhoto, (photos) => photos.user, { cascade: true })
  photos?: UserPhoto[];
}
