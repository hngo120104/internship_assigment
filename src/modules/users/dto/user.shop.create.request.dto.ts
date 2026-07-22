import { IsNotEmpty, IsString } from "class-validator";


export class UserShopCreateRequestDto {
    @IsNotEmpty() @IsString() shopName!: string;
    @IsString() description?: string;
    @IsString() address?: string;
}