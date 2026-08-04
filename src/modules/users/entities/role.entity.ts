import { Entity, Column, OneToMany } from 'typeorm';
import { PrimaryGeneratedBinaryUuidColumn } from '../../../custom.decorators/primary.generated.uuid.binary.column';
import { UserRoles } from './user.roles.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedBinaryUuidColumn()
  id!: string;

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles!: UserRoles[];

  @Column({ type: 'varchar', length: 255, default: 'CUSTOMER', unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;
}
