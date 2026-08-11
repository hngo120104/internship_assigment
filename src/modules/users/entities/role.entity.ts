import { Entity, Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRoles } from './user.roles.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles!: UserRoles[];

  @Column({ type: 'varchar', length: 255, default: 'CUSTOMER', unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;
}
