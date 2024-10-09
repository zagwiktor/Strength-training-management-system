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
    newExercise.comment = createExerciseDto.comment;
    newExercise.category = createExerciseDto.category;
    newExercise.author = user;
    newExercise.reps = createExerciseDto.reps;
    newExercise.sets = createExerciseDto.sets;
    newExercise.tempo = createExerciseDto.tempo;
    newExercise.load = createExerciseDto.load;
    return await this.exerciseRepository.save(newExercise);
  }

  findAll() {
    return `This action returns all exercise`;
  }

  findOne(id: number) {
    return `This action returns a #${id} exercise`;
  }

  update(id: number, updateExerciseDto: UpdateExerciseDto) {
    return `This action updates a #${id} exercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} exercise`;
  }
}
