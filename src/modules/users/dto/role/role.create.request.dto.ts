import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class RoleCreateRequestDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;
}