import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateTrainingPlanDto {

    @IsString()
    @IsNotEmpty()
    @Length(2, 20, { message: 'Name must be between 2 and 20 characters long.' })
    name: string;


    @IsString()
    @IsOptional()
    description?: string;


    @IsArray()
    trainingUnitsIds?: number[];


    @IsBoolean()
    @IsNotEmpty()
    mainPlan: boolean;

}
