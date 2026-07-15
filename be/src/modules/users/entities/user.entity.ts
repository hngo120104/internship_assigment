import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn} from "typeorm";
import { Shop } from "./shop.entity";
import { Role } from "../../auth/guards/role/role.enum";
import { Photo } from "./photo.entities";

@Entity("users")
export class User {

  @PrimaryGeneratedColumn() id!: number;
  @Column() username!: string;
  @Column({ unique: true }) email!: string;
  @Column({ select: false }) password!: string;
  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role!: Role;
  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Shop, shop => shop.user) shop!: Shop;
  @OneToMany(() => Photo, photos => photos.user) photos?: Photo[]; 
}
