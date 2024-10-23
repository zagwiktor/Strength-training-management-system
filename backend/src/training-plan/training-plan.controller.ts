import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { TrainingPlanService } from './training-plan.service';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { AuthGuard } from 'src/authorization/auth.guard';

@Controller('training-plan')
@UseGuards(AuthGuard)
export class TrainingPlanController {
  constructor(private readonly trainingPlanService: TrainingPlanService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  create(@Body() createTrainingPlanDto: CreateTrainingPlanDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingPlanService.create(createTrainingPlanDto, userId);
  }

  @Get('get')
  findAll(@Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingPlanService.findAll(userId);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingPlanService.findOne(+id, userId);
  }

  @Patch('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  update(@Param('id') id: string, @Body() updateTrainingPlanDto: UpdateTrainingPlanDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingPlanService.update(+id, updateTrainingPlanDto, userId);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.trainingPlanService.remove(+id, userId);
  }
}
