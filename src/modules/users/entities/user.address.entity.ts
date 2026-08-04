import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import {
  BinaryUuidColumn,
  PrimaryGeneratedBinaryUuidColumn,
} from '../../../custom.decorators/primary.generated.uuid.binary.column';

@Entity('user_addresses')
export class Address {
  @PrimaryGeneratedBinaryUuidColumn()
  id!: string;

  @BinaryUuidColumn('user_id')
  userId!: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 255 })
  recipientName!: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 10 })
  phoneNumber!: string;

  @Column({ type: 'varchar', length: 255 })
  province!: string;

  @Column({ type: 'varchar', length: 255 })
  district!: string;

  @Column({ name: 'address_line', type: 'varchar', length: 1000 })
  addressLine!: string;

  @Column({ name: 'is_primary', type: 'tinyint', default: 1 })
  isPrimary!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 6 })
  updatedAt!: Date;

  @Column({ name: 'is_deleted', type: 'tinyint', default: 0 })
  isDeleted!: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
