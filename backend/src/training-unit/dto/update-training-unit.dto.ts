import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainingUnitDto } from './create-training-unit.dto';

export class UpdateTrainingUnitDto extends PartialType(CreateTrainingUnitDto) {}
