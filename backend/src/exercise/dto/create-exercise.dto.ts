import { IsArray, IsNotEmpty, IsNumber, IsString, Length, Min } from "class-validator";
import { ExerciseCategory } from "src/exercise-category/entities/exercise-category.entity";
import { IsTempoValidation } from "./validator";

export class CreateExerciseDto {

    @IsString()
    @IsNotEmpty()
    @Length(2, 20, { message: 'Name must be between 2 and 20 characters long.' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 100, { message: 'Description must be between 2 and 100 characters long.' })
    description: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Sets must be greater than 0.' })
    sets: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(1, { message: 'Repetitions must be greater than 0.' })
    reps: number;

    @IsTempoValidation({ message: 'Tempo must be an array of four numbers.' })
    tempo: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number];

    @IsNumber()
    @Min(1, { message: 'Load must be greater than 0.' })
    load: number;

    @IsArray()
    categories: number[];
}
