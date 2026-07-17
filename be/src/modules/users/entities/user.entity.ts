import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, CreateDateColumn} from "typeorm";
import { Shop } from "./shop.entity";
import { Role } from "../../auth/guards/role/role.enum";
import { UserPhotos } from "./photo.entities";

@Entity("users")
export class User {

  @PrimaryGeneratedColumn() id!: number;
  @Column() username!: string;
  @Column({ unique: true }) email!: string;
  @Column({ select: true }) passwordHashed!: string;
  @Column({ type: 'enum', enum: Role, default: Role.CUSTOMER })
  role!: Role;
  @CreateDateColumn()
  createdAt!: Date;

  @OneToOne(() => Shop, shop => shop.user) shop!: Shop;
  @OneToMany(() => UserPhotos, photos => photos.user, { cascade: true }) photos?: UserPhotos[];   
}
