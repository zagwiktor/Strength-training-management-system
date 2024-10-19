import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { UserService } from 'src/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from './entities/exercise.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ExerciseService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>
  ) {}
  async create(createExerciseDto: CreateExerciseDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newExercise = new Exercise();
    newExercise.name = createExerciseDto.name;
    newExercise.description = createExerciseDto.description;
    newExercise.categories = createExerciseDto.categories;
    newExercise.author = user;
    newExercise.reps = createExerciseDto.reps;
    newExercise.sets = createExerciseDto.sets;
    newExercise.tempo = createExerciseDto.tempo;
    newExercise.load = createExerciseDto.load;
    return await this.exerciseRepository.save(newExercise);
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
      where: {id: id, author: {
        id: userId}}
      });

    if(!exercise){
      throw new NotFoundException('Exercise not found or you are not the author of this category!');
    }
    return exercise;
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto, userId: number) {
    const exercise = await this.findOne(id, userId);
    if(!exercise){
      throw new NotFoundException('');
    }
    return await this.exerciseRepository.update({id}, updateExerciseDto);
  }

  async remove(id: number, userId: number) {
    const exercise = await this.findOne(id, userId);
    if(!exercise){
      throw new NotFoundException('');
    }
    return await this.exerciseRepository.remove(exercise);
  }
}
