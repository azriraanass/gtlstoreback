import { IsAlphanumeric, IsEmail, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @IsAlphanumeric()
    password: string;
}   
