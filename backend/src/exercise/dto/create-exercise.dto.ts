import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { ExerciseCategory } from "src/exercise-category/entities/exercise-category.entity";
import { IsTempoValidation } from "./validator";
import { User } from "src/user/entities/user.entity";

export class CreateExerciseDto {

    @IsString()
    @IsNotEmpty()
    @Length(2, 20, { message: 'Name must be between 2 and 20 characters long.' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 100, { message: 'Comment must be between 2 and 100 characters long.' })
    comment: string;

    @IsNumber()
    @IsNotEmpty()
    sets: number;

    @IsNumber()
    @IsNotEmpty()
    reps: number;

    @IsTempoValidation({ message: 'Tempo must be an array of four numbers.' })
    tempo: [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number];

    @IsNumber()
    load: number;

    category: ExerciseCategory[];

    author: User;
    
}
