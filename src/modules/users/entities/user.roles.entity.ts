import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRoles {
  @PrimaryColumn({
    name: 'user_id',
    type: 'varchar',
    length: 36,
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: User;

  @PrimaryColumn({
    name: 'role_id',
    type: 'varchar',
    length: 36,
  })
  roleId!: string;

  @Column({ name: 'is_deleted' })
  isDeleted!: boolean;

  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role!: Role;
}
