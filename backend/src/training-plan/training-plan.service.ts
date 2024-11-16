import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingPlan } from './entities/training-plan.entity';
import { Repository } from 'typeorm';
import { ExerciseService } from 'src/exercise/exercise.service';

interface orderedExercises {
  order: number,
  pkOfExercise: number
}

@Injectable()
export class TrainingPlanService {
  constructor(
    private readonly userService: UserService,
    private readonly exerciseService: ExerciseService,
    @InjectRepository(TrainingPlan) private traningPlanRepository: Repository<TrainingPlan>
  ){}

  async create(createTrainingPlanDto: CreateTrainingPlanDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if(!user){
      throw new NotFoundException('User not found');
    }
    const exercises = await this.exerciseService.findByIds(createTrainingPlanDto.exercises);
    const newTrainingPlan = new TrainingPlan();
    newTrainingPlan.author = user;
    newTrainingPlan.description = createTrainingPlanDto.description;
    newTrainingPlan.name = createTrainingPlanDto.name;
    newTrainingPlan.exercises = exercises;
    newTrainingPlan.orderedExercises = exercises.map((value, index) => ({
      order: index,
      pkOfExercise: value.id,
    }));
    if (createTrainingPlanDto.mainPlan) {
      const mainPlan = await this.getMainPlan(userId);
      if (mainPlan) {
          await this.traningPlanRepository.update({ id: mainPlan.id }, { mainPlan: false });
      }
    }
    newTrainingPlan.mainPlan = createTrainingPlanDto.mainPlan ?? false;
    return await this.traningPlanRepository.save(newTrainingPlan);
  }

  async findAll(userId: number) {
    const traningPlans = await this.traningPlanRepository.find({
      where: {author: {id: userId}},
      relations: ['exercises']});
    return traningPlans;
  }

  async getMainPlan(userId: number) {
    const mainTrainingPlan = await this.traningPlanRepository.findOne({where: 
      {author: {id: userId}, mainPlan: true},
      relations: ['exercises']});
    return mainTrainingPlan;
  }

  async findOne(id: number, userId: number) {
    const traningPlan = await this.traningPlanRepository.findOne({where: {id: id, author: {
      id: userId }}, 
      relations: ['exercises'] });
    if(!traningPlan){
      throw new NotFoundException('Traning plan not found or you are not the author of this plan!');
    }
    return traningPlan;
  }

  async update(id: number, updateTrainingPlanDto: UpdateTrainingPlanDto, userId: number, orderedExercises?: orderedExercises[]) {
    const existingPlan = await this.traningPlanRepository.findOne({
      where: { id },
      relations: ['exercises'],
    });
  
    if (!existingPlan) {
      throw new NotFoundException(`Training plan with id ${id} not found`);
    }
  
    const { exercises, mainPlan, ...rest } = updateTrainingPlanDto;
  
    if (exercises && exercises.length > 0) {
      const exercisesEntities = await this.exerciseService.findByIds(exercises);
      existingPlan.exercises = exercisesEntities;
    }
  
    if (mainPlan) {
      const currentMainPlan = await this.getMainPlan(userId);
      if (currentMainPlan && currentMainPlan.id !== id) {
        await this.traningPlanRepository.update({ id: currentMainPlan.id }, { mainPlan: false });
      }
    }
  
    if (orderedExercises) {
      if (orderedExercises.length !== existingPlan.exercises.length) {
        throw new BadRequestException(
          'The number of orderedExercises does not match the number of exercises in the training plan.'
        );
      }
      existingPlan.orderedExercises = orderedExercises;
    } else {
      if (existingPlan.exercises) {
        existingPlan.orderedExercises = existingPlan.exercises.map((value, index) => ({
          order: index,
          pkOfExercise: value.id,
        }));
      } else {
        throw new BadRequestException(
          'Exercises are missing. Unable to create orderedExercises.'
        );
      }
    }
  
    existingPlan.mainPlan = mainPlan ?? false;
    Object.assign(existingPlan, rest);
  
    return await this.traningPlanRepository.save(existingPlan);
  }

  async remove(id: number, userId: number) {
    const traningPlan = await this.findOne(id, userId);
    return await this.traningPlanRepository.remove(traningPlan);
  }
}
