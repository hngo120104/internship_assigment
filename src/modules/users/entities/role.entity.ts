import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserRoles } from './user.roles.entity';

export enum RoleType {
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  CUSTOMER = 'CUSTOMER',
}

@Unique('UQ_roletype', ['roleType'])
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles!: UserRoles[];

  @Column({
    name: 'role_type',
    type: 'enum',
    enum: RoleType,
    default: RoleType.CUSTOMER,
  })
  roleType!: RoleType;

  @Column({ type: 'varchar', length: 255, default: 'CUSTOMER' })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;
}
