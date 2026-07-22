import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserShopCreateResponseDto {
    @Expose() shopName!: string;
    @Expose() description?: string;
    @Expose() address?: string;
}