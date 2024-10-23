import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExerciseCategoryService } from './exercise-category.service';
import { CreateExerciseCategoryDto } from './dto/create-exercise-category.dto';
import { UpdateExerciseCategoryDto } from './dto/update-exercise-category.dto';
import { AuthGuard } from 'src/authorization/auth.guard';

@Controller('exercise-category')
@UseGuards(AuthGuard)
export class ExerciseCategoryController {
  constructor(private readonly exerciseCategoryService: ExerciseCategoryService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  create(@Body() createExerciseCategoryDto: CreateExerciseCategoryDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseCategoryService.create(createExerciseCategoryDto, userId);
  }

  @Get('get')
  findAll(@Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseCategoryService.findAll(userId);
  }

  @Get('get/:id')
  findOne(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseCategoryService.findOne(+id, userId);
  }

  @Patch('update/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
  update(@Param('id') id: string, @Body() updateExerciseCategoryDto: UpdateExerciseCategoryDto, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseCategoryService.update(+id, updateExerciseCategoryDto, userId);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string, @Req() request) {
    const userId = request.decodedData.sub;
    return this.exerciseCategoryService.remove(+id, userId);
  }
}
