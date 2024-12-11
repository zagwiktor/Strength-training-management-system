import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRaportDto } from './dto/create-raport.dto';
import { UpdateRaportDto } from './dto/update-raport.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Raport } from './entities/raport.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { TrainingPlanService } from 'src/training-plan/training-plan.service';


@Injectable()
export class RaportService {
  constructor(
    @InjectRepository(Raport) private raportRepository: Repository<Raport>,
    private readonly userService: UserService,
    private readonly traningPlanService: TrainingPlanService,
  ) {}
  async create(createRaportDto: CreateRaportDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newRaport = new Raport();
    newRaport.author = user;
    newRaport.bicepsCircuit = createRaportDto.bicepsCircuit;
    newRaport.calfCircuit = createRaportDto.calfCircuit;
    newRaport.dateCreated = createRaportDto.dateCreated;
    newRaport.chestCircuit = createRaportDto.chestCircuit;
    newRaport.thighCircuit = createRaportDto.thighCircuit;
    newRaport.waistCircuit = createRaportDto.waistCircuit;
    newRaport.weight = createRaportDto.weight;
    newRaport.loads = createRaportDto.loads;
    const traningPlan = await this.traningPlanService.findOne(createRaportDto.trainingPlanId, userId);
    newRaport.trainingPlan = traningPlan;
    const raportRes = await this.raportRepository.save(newRaport);
    const {author, trainingPlan, ...raport} = raportRes;
    return raport;
  }

  async findAll(userId: number, trainingPlanId: number) {
    const raports = await this.raportRepository.find({
      where: {
          author: { id: userId },
          trainingPlan: { id: trainingPlanId }
      }
    });
    if (raports.length === 0) {
      throw new NotFoundException(`No reports found for training plan ID ${trainingPlanId} or the provided ID is incorrect.`);
    }
    return raports;
  }

  async findOne(id: number, userId: number) {
    const raport = await this.raportRepository.findOne({
      where: {
        id: id,
        author: {
          id: userId
        }
      },
      relations: ['trainingPlan'] 
    });
    if(!raport){
      throw new NotFoundException('Raport not found or you are not the author of this raport!')
    }
    return raport;
  }

  async update(id: number, updateRaportDto: UpdateRaportDto, userId: number) {
    const raport = await this.findOne(id, userId);
    const traningPlan = raport.trainingPlan;
    const {trainingPlanId, ...rest} = updateRaportDto;
    const updateData: Partial<Raport> = {
        ...rest,
        trainingPlan: traningPlan,
    };
    const updateResult = await this.raportRepository.update({ id }, updateData);
    if (updateResult.affected === 0) {
        throw new NotFoundException(`Raport with id ${id} not found`);
    }
    return await this.findOne(id, userId);
  }

  async remove(id: number, userId: number) {
    const raport = await this.findOne(id, userId);
    return await this.raportRepository.remove(raport);
  }
}
