import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TrainingUnitService } from './training-unit.service';
import { CreateTrainingUnitDto } from './dto/create-training-unit.dto';
import { UpdateTrainingUnitDto } from './dto/update-training-unit.dto';
import { AuthGuard } from 'src/authorization/auth.guard';

@Controller('training-units')
@UseGuards(AuthGuard)
export class TrainingUnitController {
  constructor(private readonly trainingUnitService: TrainingUnitService) {}

  @Post('create')
  create(@Body() createTrainingUnitDto: CreateTrainingUnitDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingUnitService.create(createTrainingUnitDto, userId);
  }

  @Get('get')
  findAll(@Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingUnitService.findAll(userId);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingUnitService.findOne(+id, userId);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateTrainingUnitDto: UpdateTrainingUnitDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingUnitService.update(+id, updateTrainingUnitDto, userId);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingUnitService.remove(+id, userId);
  }
}
