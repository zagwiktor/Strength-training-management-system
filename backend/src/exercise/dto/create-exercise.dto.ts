import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min } from "class-validator";


export class CreateExerciseDto {

    @IsString()
    @IsNotEmpty()
    @Length(2, 20, { message: 'Name must be between 2 and 20 characters long.' })
    name: string;

    @IsString()
    @IsOptional()
    @Length(2, 100, { message: 'Description must be between 2 and 100 characters long.' })
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Sets must be greater than 0.' })
    sets: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Repetitions must be greater than 0.' })
    reps: number;

    @IsOptional()
    tempo?: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number];

    @IsNumber()
    @Min(1, { message: 'Load must be greater than 0.' })
    @IsOptional()
    load?: number;

    @IsArray()
    categories: number[];
}
