import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { In, Repository } from 'typeorm';
import { ExerciseCategoryService } from 'src/exercise-category/exercise-category.service';
import e from 'express';

@Injectable()
export class ExerciseService {
  constructor(
    private readonly userService: UserService,
    private readonly categoryService: ExerciseCategoryService,
    @InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>
  ) {}
  async create(createExerciseDto: CreateExerciseDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (createExerciseDto.tempo) {
      if (!Array.isArray(createExerciseDto.tempo)) {
        throw new BadRequestException('Tempo must be an array.');
      }
      if (createExerciseDto.tempo.length !== 4) {
        throw new BadRequestException('Tempo must contain exactly 4 elements.');
      }
      if (!createExerciseDto.tempo.every(value => typeof value === 'number')) {
        throw new BadRequestException('Tempo must be an array of numbers.');
      }
    }
    const categories = await this.categoryService.findByIds(createExerciseDto.categories)
    const newExercise = new Exercise();
    newExercise.name = createExerciseDto.name;
    newExercise.description = createExerciseDto.description;
    newExercise.categories = categories;
    newExercise.author = user;
    newExercise.reps = createExerciseDto.reps;
    newExercise.sets = createExerciseDto.sets;
    newExercise.tempo = createExerciseDto.tempo;
    newExercise.load = createExerciseDto.load;
    const exerciseRes = await this.exerciseRepository.save(newExercise);
    const {author, ...exercise} = exerciseRes;
    return exercise;
  }

  async findByIds(exerciseIds: number[]): Promise<Exercise[]> {
    if (!exerciseIds || exerciseIds.length === 0){
      return []
    }
    const exercises = await this.exerciseRepository.find({
        where: {
            id: In(exerciseIds),
        },
    });
    if (exercises.length !== exerciseIds.length) {
        throw new NotFoundException('Some exercises not found');
    }
    return exercises;
  }

  async findAll(userId: number) {
    const user = this.userService.findOne(userId);
    if(!user) {
      throw new NotFoundException('User not found');
    }
    const exercises = await this.exerciseRepository.find({
      where: {author: {id: userId}},
      relations: ['categories']});
    return exercises;
  }

  async findOne(id: number, userId: number) {
    const exercise = await this.exerciseRepository.findOne({
      where: {id: id, author: {id: userId}},
      relations: ['categories']});
    if(!exercise){
      throw new NotFoundException('Exercise not found or you are not the author of this exercise!');
    }
    return exercise;
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto, userId: number) {
    await this.findOne(id, userId);
    const { categories, ...rest } = updateExerciseDto;
    let updateData: Partial<Exercise> = { ...rest };
    if (categories && categories.length > 0) {
        const categoriesEntities = await this.categoryService.findByIds(categories);
        updateData.categories = categoriesEntities;
    }
    const updateResult = await this.exerciseRepository.update({ id }, updateData);
    if (updateResult.affected === 0) {
        throw new NotFoundException(`Exercise with id ${id} not found`);
    }
    return await this.findOne(id, userId);
  }


  async remove(id: number, userId: number) {
    const exercise = await this.findOne(id, userId);
    return await this.exerciseRepository.remove(exercise);
  }
}
