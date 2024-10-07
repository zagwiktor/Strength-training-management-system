import { IsEmail, IsNotEmpty, IsString, IsNumber, Length, Matches } from "class-validator";
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
    @Matches(
    /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}/,
        {
          message:
            'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special character.',
        },
    )
    password: string;

    @IsEmail()
    @Unique(['email'])
    @IsNotEmpty()
    email: string;

    @IsNumber()
    @IsNotEmpty()
    weight: number;

    @IsNumber()
    @IsNotEmpty()
    height: number;

    @IsString()
    @IsNotEmpty()
    gender: "Male" | "Female";
}
