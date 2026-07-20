import { Exclude, Expose } from "class-transformer";


@Exclude() 
export class UserProductsResponseDto {
    @Expose() name!: string;
    @Expose() type!: string;
    @Expose() description?: string;
    @Expose() stock!: number;
    @Expose() price!: number;
    @Expose() isActive!: boolean;
    @Expose() createdAt!: Date;
    @Expose() updatedAt?: Date;
}