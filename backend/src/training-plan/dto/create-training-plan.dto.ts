import { IsArray, IsBoolean, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateTrainingPlanDto {

    @IsString()
    @IsNotEmpty()
    @Length(2, 20, { message: 'Name must be between 2 and 20 characters long.' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 100, { message: 'Description must be between 2 and 100 characters long.' })
    description: string;


    @IsArray()
    @IsNotEmpty({ each: true })
    exercises: number[];


    @IsBoolean()
    @IsNotEmpty()
    mainPlan: boolean;
}
