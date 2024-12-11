import { Type } from 'class-transformer';
import { IsNotEmpty, IsDate, IsNumber, IsOptional, IsObject, Min } from 'class-validator';

export class CreateRaportDto {
    
    @IsNumber()
    @IsNotEmpty({ message: 'Training Plan ID is required' })
    trainingPlanId: number;

    @IsNumber()
    @Min(0, { message: 'Weight must be a positive number' })
    weight: number;

    @IsNumber()
    @Min(0, { message: 'Chest Circuit must be a positive number' })
    chestCircuit: number;

    @IsNumber()
    @Min(0, { message: 'Biceps Circuit must be a positive number' })
    bicepsCircuit: number;

    @IsNumber()
    @Min(0, { message: 'Thigh Circuit must be a positive number' })
    thighCircuit: number;

    @IsNumber()
    @Min(0, { message: 'Waist Circuit must be a positive number' })
    waistCircuit: number;

    @IsNumber()
    @Min(0, { message: 'Calf Circuit must be a positive number' })
    calfCircuit: number;

    @IsObject({ message: 'Loads must be an object with key-value pairs' })
    @IsOptional()
    loads?: Record<string, number>;

    @IsDate()
    @Type(() => Date)
    dateCreated?: Date;
}

