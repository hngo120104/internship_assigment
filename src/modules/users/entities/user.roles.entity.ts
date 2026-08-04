import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { UuidBinaryTransformer } from '../../transformer/uuid.binary.transformer';

@Entity('user_roles')
export class UserRoles {
  @PrimaryColumn({
    name: 'user_id',
    type: 'binary',
    length: 16,
    transformer: UuidBinaryTransformer,
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user!: User;

  @PrimaryColumn({
    name: 'role_id',
    type: 'binary',
    length: 16,
    transformer: UuidBinaryTransformer,
  })
  roleId!: string;

  @Column({ name: 'is_deleted' })
  isDeleted!: boolean;

  @ManyToOne(() => Role, (role) => role.userRoles)
  @JoinColumn({ name: 'role_id', referencedColumnName: 'id' })
  role!: Role;
}
