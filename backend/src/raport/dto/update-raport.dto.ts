import { PartialType } from '@nestjs/mapped-types';
import { CreateRaportDto } from './create-raport.dto';

export class UpdateRaportDto extends PartialType(CreateRaportDto) {}
