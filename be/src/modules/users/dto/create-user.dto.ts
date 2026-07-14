import { IsNotEmpty, IsString, MinLength, IsEnum, IsEmail } from "class-validator";
import { UserRole } from "../../auth/dto/register.dto";


export class CreateUserDto {
    @IsString() @IsNotEmpty() username!: string;
    @IsString() full_name?: string;
    @IsEmail() @IsNotEmpty() email!: string;
    @MinLength(6) @IsNotEmpty() password!: string;
    @IsEnum(UserRole) @IsNotEmpty() role!: UserRole;
}
