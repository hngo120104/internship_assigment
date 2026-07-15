import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany} from "typeorm";
import { User } from "./user.entity";

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ nullable: true }) description!: string;
  @Column({ nullable: true }) address!: string;

  @OneToOne(() => User, user => user.shop)
  @JoinColumn({ name: 'user_id' })
  user!: User;

//   @OneToMany(() => Product, p => p.shop) products: Product[];
}
