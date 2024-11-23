import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainingUnitDto } from './dto/create-training-unit.dto';
import { UpdateTrainingUnitDto } from './dto/update-training-unit.dto';
import { UserService } from 'src/user/user.service';
import { ExerciseService } from 'src/exercise/exercise.service';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingUnit } from './entities/training-unit.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class TrainingUnitService {
  constructor(
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
    @InjectRepository(TrainingUnit) private trainingUnitRepository: Repository<TrainingUnit>
  ){}
  async create(createTrainingUnitDto: CreateTrainingUnitDto, userId) {
    const user = await this.userService.findOne(userId);
    if(!user){
      throw new NotFoundException('User not found');
    }
    const exercises = await this.exerciseService.findByIds(createTrainingUnitDto.exercises);
    const newTrainingUnit = new TrainingUnit();
    newTrainingUnit.description = createTrainingUnitDto.description;
    newTrainingUnit.exercises = exercises;
    newTrainingUnit.author = user;
    newTrainingUnit.name = createTrainingUnitDto.name;
    newTrainingUnit.orderedExercises = exercises.map((value, index) => ({
      order: index,
      pkOfExercise: value.id,
    }));
    const trainingUnitRes = await this.trainingUnitRepository.save(newTrainingUnit)
    const {author, ...trainingUnit} = trainingUnitRes;
    return trainingUnit;
  }

  async findAll(userId: number) {
    const user = await this.userService.findOne(userId);
    if(!user){
      throw new NotFoundException('User not found');
    }
    const trainingUnits = this.trainingUnitRepository.find({where: {
      author: {
        id: userId
      }},
      relations: ['exercises']
    })
    return trainingUnits;
  }


  async findByIds(trainingUnitIds: number[]): Promise<TrainingUnit[]> {
    if (!trainingUnitIds || trainingUnitIds.length === 0) {
      return [];
    }
    const trainingUnits = await this.trainingUnitRepository.find({
      where: {
        id: In(trainingUnitIds),
      },
    });
    if (trainingUnits.length !== trainingUnitIds.length) {
      throw new NotFoundException('Some training units not found');
    }

    return trainingUnits;
  }

  async findOne(id: number, userId: number) {
    const trainingUnit = await this.trainingUnitRepository.findOne({where: {
      id: id, author: {
        id: userId }}, 
      relations: ['exercises'] });
    if(!trainingUnit){
      throw new NotFoundException('Traning unit not found or you are not the author of this plan!');
    }
    return trainingUnit;
  }

  async update(id: number, updateTrainingUnitDto: UpdateTrainingUnitDto, userId: number) {
    const existingTrainingUnit = await this.findOne(id, userId);

    const {exercises, orderedExercisesUpdated, ...rest} = updateTrainingUnitDto;

    if (exercises && exercises.length > 0) {
      const exercisesEntities = await this.exerciseService.findByIds(exercises);
      existingTrainingUnit.exercises = exercisesEntities;
    }

    if (orderedExercisesUpdated) {
      if (orderedExercisesUpdated.length !== existingTrainingUnit.exercises.length) {
        throw new BadRequestException(
          'The number of orderedExercises does not match the number of exercises in the training unit.'
        );
      }
      existingTrainingUnit.orderedExercises = orderedExercisesUpdated;
    } else {
      if (existingTrainingUnit.exercises) {
        existingTrainingUnit.orderedExercises = existingTrainingUnit.exercises.map((value, index) => ({
          order: index,
          pkOfExercise: value.id,
        }));
      } else {
        throw new BadRequestException(
          'Exercises are missing. Unable to create orderedExercises.'
        );
      }
    }
    Object.assign(existingTrainingUnit, rest);
    return await this.trainingUnitRepository.save(existingTrainingUnit);
  }

  async remove(id: number, userId: number) {
    const trainingUnit = await this.findOne(id, userId);
    return await this.trainingUnitRepository.remove(trainingUnit);
  }
}
