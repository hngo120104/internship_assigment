import { IsEmail, MinLength, ValidateIf } from "class-validator";

export class LoginDto {
    @IsEmail() email!: string;
    @MinLength(6) password!: string;
}
