import { IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";
import { Unique } from "typeorm";

export class CreateDietDto {
    
    @IsString()
    @Length(2, 20, { message: 'Name must be between 2 and 20 characters long.' })
    name: string;

    @IsString()
    @Length(5, 150, { message: 'Description must be between 5 and 150 characters long.' })
    description: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Calories must be greater than 0.' })
    calories: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Protein must be greater than 0.' })
    protein: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Fat must be greater than 0.' })
    fat: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Carbohydrates must be greater than 0.' })
    carbohydrates: number;

}
