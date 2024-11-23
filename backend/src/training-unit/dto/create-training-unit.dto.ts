import { IsArray, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateTrainingUnitDto {
    @IsString()
    @IsNotEmpty()
    @Length(2, 20, { message: 'Name must be between 2 and 20 characters long.' })
    name: string;

    @IsString()
    @IsOptional()
    @Length(2, 100, { message: 'Description must be between 2 and 100 characters long.' })
    description?: string;

    @IsArray()
    @IsNotEmpty({ each: true })
    exercises: number[];
    
    @IsOptional()
    @IsArray()
    orderedExercisesUpdated?: { order: number, pkOfExercise: number }[];
}
