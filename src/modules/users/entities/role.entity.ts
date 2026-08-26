import {
  Entity,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserRoles } from './user.roles.entity';

@Unique('UQ_roles_name', ['name'])
@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles!: UserRoles[];

  @Column({ type: 'varchar', length: 255, default: 'CUSTOMER' })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;
}
