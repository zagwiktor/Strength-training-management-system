import { IsEmail, IsNotEmpty, IsString, IsNumber, Length, Matches, IsStrongPassword, Min } from "class-validator";
import { Unique } from "typeorm";

export class CreateUserDto {
    
    @IsString()
    @IsNotEmpty()
    @Length(2, 15, { message: 'Name must be between 5 and 15 characters long.' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 15, { message: 'Surname must be between 5 and 15 characters long.' })
    surname: string;

    @IsString()
    @IsStrongPassword({
        minLength: 12,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minLowercase: 1
    })
    password: string;

    @IsEmail()
    @Unique(['email'])
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'Weight must be a positive number' })
    weight: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'Height must be a positive number' })
    height: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0, { message: 'Age must be a positive number' })
    age: number;

    @IsString()
    @IsNotEmpty()
    gender: "Male" | "Female";
}
