import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { In, Repository } from 'typeorm';
import { ExerciseCategoryService } from 'src/exercise-category/exercise-category.service';

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
    return await this.exerciseRepository.save(newExercise);
  }

  async findByIds(exerciseIds: number[]): Promise<Exercise[]> {
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
    const exercises = await this.exerciseRepository.find({where: {author: {id: userId}}});
    return exercises;
  }

  async findOne(id: number, userId: number) {
    const exercise = await this.exerciseRepository.findOne({
      where: {id: id, author: {id: userId}},
      relations: ['categories']});
    if(!exercise){
      throw new NotFoundException('Exercise not found or you are not the author of this category!');
    }
    return exercise;
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto, userId: number) {
    await this.findOne(id, userId);
    const {categories, ...rest} = updateExerciseDto;
    const categoriesEntities = await this.categoryService.findByIds(categories)
    const updateResult = await this.exerciseRepository.update({ id }, {
      ...rest,
      categories: categoriesEntities,
    });
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
