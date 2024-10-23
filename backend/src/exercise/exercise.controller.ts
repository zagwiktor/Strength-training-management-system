import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, Req, UseGuards } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { AuthGuard } from 'src/authorization/auth.guard';

@Controller('exercise')
@UseGuards(AuthGuard)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  create(@Body() createExerciseDto: CreateExerciseDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseService.create(createExerciseDto, userId);
  }

  @Get('get')
  findAll(@Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseService.findAll(userId);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseService.findOne(+id, userId);
  }

  @Patch('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseService.update(+id, updateExerciseDto, userId);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseService.remove(+id, userId);
  }
}
