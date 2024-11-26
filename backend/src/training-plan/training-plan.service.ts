import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainingPlanDto } from './dto/create-training-plan.dto';
import { UpdateTrainingPlanDto } from './dto/update-training-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingPlan } from './entities/training-plan.entity';
import { Repository } from 'typeorm';
import { TrainingUnitService } from 'src/training-unit/training-unit.service';


@Injectable()
export class TrainingPlanService {
  constructor(
    private readonly userService: UserService,
    private readonly trainingUnitsService: TrainingUnitService,
    @InjectRepository(TrainingPlan) private traningPlanRepository: Repository<TrainingPlan>
  ){}

  async create(createTrainingPlanDto: CreateTrainingPlanDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if(!user){
      throw new NotFoundException('User not found');
    }
    const newTrainingPlan = new TrainingPlan();
    newTrainingPlan.author = user;
    newTrainingPlan.description = createTrainingPlanDto.description;
    newTrainingPlan.name = createTrainingPlanDto.name;
    if (createTrainingPlanDto.mainPlan) {
      const mainPlan = await this.getMainPlan(userId);
      if (mainPlan) {
          await this.traningPlanRepository.update({ id: mainPlan.id }, { mainPlan: false });
      }
    }
    newTrainingPlan.trainingUnits = await this.trainingUnitsService.findByIds(createTrainingPlanDto.trainingUnitsIds);
    newTrainingPlan.mainPlan = createTrainingPlanDto.mainPlan ?? false;

    const trainingPlanRes = await this.traningPlanRepository.save(newTrainingPlan);
    const {author, ...trainingPlan} = trainingPlanRes;
    return  trainingPlan;
  }

  async findAll(userId: number) {
    const traningPlans = await this.traningPlanRepository.find({
      where: {author: {id: userId}},
      relations: ['trainingUnits', 'trainingUnits.exercises']});
    return traningPlans;
  }

  async getMainPlan(userId: number) {
    const mainTrainingPlan = await this.traningPlanRepository.findOne({where: 
      {author: {id: userId}, mainPlan: true},
      relations: ['trainingUnits', 'trainingUnits.exercises']});
    return mainTrainingPlan;
  }

  async findOne(id: number, userId: number) {
    const traningPlan = await this.traningPlanRepository.findOne({where: {id: id, author: {
      id: userId }}, 
      relations: ['trainingUnits', 'trainingUnits.exercises'] });
    if(!traningPlan){
      throw new NotFoundException('Traning plan not found or you are not the author of this plan!');
    }
    return traningPlan;
  }

  async update(id: number, updateTrainingPlanDto: UpdateTrainingPlanDto, userId: number) {
    const existingPlan = await this.traningPlanRepository.findOne({
      where: { id },
      relations: ['trainingUnits', 'trainingUnits.exercises'],
    });
  
    if (!existingPlan) {
      throw new NotFoundException(`Training plan with id ${id} not found`);
    }
    const { trainingUnitsIds, mainPlan, ...rest } = updateTrainingPlanDto;
    if (trainingUnitsIds && trainingUnitsIds.length > 0) {
      const trainingUnits = await this.trainingUnitsService.findByIds(trainingUnitsIds);
      existingPlan.trainingUnits = trainingUnits;
    }
    if (mainPlan === true) { 
      const currentMainPlan = await this.getMainPlan(userId);
      if (currentMainPlan && currentMainPlan.id !== id) {
        currentMainPlan.mainPlan = false;
        await this.traningPlanRepository.save(currentMainPlan);
      }
      existingPlan.mainPlan = true;
    } else if (mainPlan === undefined) {
      existingPlan.mainPlan = existingPlan.mainPlan;
    } else {
      existingPlan.mainPlan = false;
    }
    Object.assign(existingPlan, rest);
    return await this.traningPlanRepository.save(existingPlan);
  }

  async remove(id: number, userId: number) {
    const traningPlan = await this.findOne(id, userId);
    return await this.traningPlanRepository.remove(traningPlan);
  }
}
