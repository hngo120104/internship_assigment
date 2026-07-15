import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('photos')
export class Photo {
    @PrimaryGeneratedColumn('uuid') id!: string;
    @Column() type!: string;
    @Column({ unique: true }) url!: string;
    @CreateDateColumn() createdAt!: Date;
    @ManyToOne(() => User, user => user.photos) user!: User;
}