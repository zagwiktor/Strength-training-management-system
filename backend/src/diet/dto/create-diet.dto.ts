import { IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";

export class CreateDietDto {
    
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
