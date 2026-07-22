import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class UserShopCreateRequestDto {
    @IsNotEmpty() @IsString() shopName!: string;
    @IsString() @IsOptional() description?: string;
    @IsString() @IsOptional() address?: string;
}