import {Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany} from "typeorm";
import { User } from "./user.entity";
import { Product } from "../../products/entities/product.entity";

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn() id!: number;
  @Column() shopName!: string;
  @Column({ nullable: true }) description?: string;
  @Column({ nullable: true }) address!: string;

  @OneToOne(() => User, user => user.shop, { onDelete: 'CASCADE'} )
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @OneToMany(() => Product, (product) => product.shop, { cascade: true })
  products!: Product[];
}
