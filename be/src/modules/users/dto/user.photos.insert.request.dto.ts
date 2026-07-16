import { IsNotEmpty, IsString } from 'class-validator';

export class UserPhotosInsertRequestDto {  
  @IsNotEmpty() @IsString() url!: string;
  @IsNotEmpty() @IsString() type!: string;
}
