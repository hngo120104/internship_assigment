// import {Entity, PrimaryGeneratedColumn, Column, OneToOne} from "typeorm";
// import { Shop } from "./shop.entity";
// import { Cart } from "./cart.entity";

// export enum UserRole{CUSTOMER = "customer", SHOP = "shop"};

// @Entity("users")
// export class User {
    
//   @PrimaryGeneratedColumn() id!: number;
//   @Column() username!: string;
//   @Column() name!: string;
//   @Column() password!: string;
//   @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
//   role!: UserRole;

//   @OneToOne(() => Shop, shop => shop.user) shop!: Shop;
//   @OneToOne(() => Cart, cart => cart.user) cart: Cart;
// }
