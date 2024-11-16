import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingPlanDto } from './create-training-plan.dto';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTrainingPlanDto extends PartialType(CreateTrainingPlanDto) {}



