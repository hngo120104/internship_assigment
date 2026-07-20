import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('photos')
export class UserPhoto {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() type!: string;
  @Column() url!: string;
  @CreateDateColumn() createdAt!: Date;
  @Column({ name: 'user_id' }) userId!: number;
  @ManyToOne(() => User, (user) => user.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
