import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingPlan } from './entities/training-plan.entity';
import { Repository } from 'typeorm';
import { ExerciseService } from 'src/exercise/exercise.service';

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
    return await this.traningPlanRepository.save(newTrainingPlan);
  }

  async findAll(userId: number) {
    const traningPlans = await this.traningPlanRepository.find({
      where: {author: {id: userId}},
      relations: ['exercises']});
    return traningPlans;
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

  async update(id: number, updateTrainingPlanDto: UpdateTrainingPlanDto, userId: number) {
    await this.findOne(id, userId);
    const {exercises, ...rest} = updateTrainingPlanDto;
    let updateData: Partial<TrainingPlan> = { ...rest };
    if(exercises && exercises.length > 0){
      const exercisesEntities = await this.exerciseService.findByIds(exercises);
      updateData.exercises = exercisesEntities;
    };
    const updateResult = await this.traningPlanRepository.update({ id }, updateData);
    if (updateResult.affected === 0) {
      throw new NotFoundException(`Training plan with id ${id} not found`);
    }
    return await this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    const traningPlan = await this.findOne(id, userId);
    return await this.traningPlanRepository.remove(traningPlan);
  }
}
