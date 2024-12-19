import { RaportService } from './raport.service';
import { UserService } from '../user/user.service';
import { TrainingPlanService } from '../training-plan/training-plan.service';
import { Repository } from 'typeorm';
import { Raport } from './entities/raport.entity';
import { User } from '../user/entities/user.entity';
import { TrainingPlan } from '../training-plan/entities/training-plan.entity';
import { NotFoundException } from '@nestjs/common';

describe('RaportService', () => {
  let raportService: RaportService;
  let raportRepository: Repository<Raport>;
  let userService: UserService;
  let trainingPlanService: TrainingPlanService;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: 'John',
    surname: 'Doe',
    gender: 'Male',
    weight: 70,
    height: 175,
    password: 'hashedPassword',
    exercisesCategories: [],
    exercises: [],
    diet: null,
    traningPlans: [],
    raports: [],
    trainingUnits: [],
  };

  const mockTrainingPlan: TrainingPlan = {
    id: 1,
    name: 'Training Plan 1',
    description: 'A sample training plan',
    dateCreated: new Date(),
    mainPlan: true,
    author: mockUser,
    raports: [],
    trainingUnits: [],
  };

  const mockRaport: Raport = {
    id: 1,
    dateCreated: new Date('2024-01-01'),
    weight: 75,
    chestCircuit: 100,
    bicepsCircuit: 35,
    thighCircuit: 55,
    waistCircuit: 80,
    calfCircuit: 40,
    loads: undefined, 
    trainingPlan: mockTrainingPlan,
    author: mockUser,
  };

  const mockRaportRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockTrainingPlanService = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    raportRepository = mockRaportRepository as unknown as Repository<Raport>;
    userService = mockUserService as unknown as UserService;
    trainingPlanService = mockTrainingPlanService as unknown as TrainingPlanService;

    raportService = new RaportService(raportRepository, userService, trainingPlanService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new raport', async () => {
        mockUserService.findOne.mockResolvedValue(mockUser);
        mockTrainingPlanService.findOne.mockResolvedValue(mockTrainingPlan);
        mockRaportRepository.save.mockResolvedValue(mockRaport);
      
        const createRaportDto = {
          trainingPlanId: 1,
          weight: 75,
          chestCircuit: 100,
          bicepsCircuit: 35,
          thighCircuit: 55,
          waistCircuit: 80,
          calfCircuit: 40,
          loads: { benchPress: 100, squat: 120 },
          dateCreated: new Date(),
        };
      
        const result = await raportService.create(createRaportDto, 1);
      
        expect(result).toEqual({
          id: mockRaport.id,
          dateCreated: mockRaport.dateCreated,
          weight: mockRaport.weight,
          chestCircuit: mockRaport.chestCircuit,
          bicepsCircuit: mockRaport.bicepsCircuit,
          thighCircuit: mockRaport.thighCircuit,
          waistCircuit: mockRaport.waistCircuit,
          calfCircuit: mockRaport.calfCircuit,
          loads: mockRaport.loads,
        });
        expect(mockUserService.findOne).toHaveBeenCalledWith(1);
        expect(mockTrainingPlanService.findOne).toHaveBeenCalledWith(1, 1);
        expect(mockRaportRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
        mockUserService.findOne.mockResolvedValue(null);
      
        const createRaportDto = {
          trainingPlanId: 1,
          weight: 75,
          chestCircuit: 100, 
          bicepsCircuit: 35, 
          thighCircuit: 55, 
          waistCircuit: 80, 
          calfCircuit: 40, 
          loads: undefined, 
          dateCreated: new Date(), 
        };
      
        await expect(
          raportService.create(createRaportDto, 1),
        ).rejects.toThrow(NotFoundException);
      });
  });

  describe('findAll', () => {
    it('should return raports for a user and training plan', async () => {
      mockRaportRepository.find.mockResolvedValue([mockRaport]);

      const result = await raportService.findAll(1, 1);

      expect(result).toEqual([mockRaport]);
      expect(mockRaportRepository.find).toHaveBeenCalledWith({
        where: { author: { id: 1 }, trainingPlan: { id: 1 } },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single raport', async () => {
      mockRaportRepository.findOne.mockResolvedValue(mockRaport);
  
      const result = await raportService.findOne(1, 1);
  
      expect(result).toEqual(mockRaport);
      expect(mockRaportRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, author: { id: 1 } },
        relations: ['trainingPlan'],
      });
    });
  
    it('should throw NotFoundException if raport is not found', async () => {
      mockRaportRepository.findOne.mockResolvedValue(null);
  
      await expect(raportService.findOne(1, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRaportRepository.findOne).toHaveBeenCalled();
    });
  });
 
  describe('update', () => {
    it('should update a raport', async () => {
      mockRaportRepository.findOne.mockResolvedValue(mockRaport);
      mockRaportRepository.update.mockResolvedValue({ affected: 1 });
      mockRaportRepository.findOne.mockResolvedValue({
        ...mockRaport,
        weight: 80,
      });
  
      const updateDto = { weight: 80 };
  
      const result = await raportService.update(1, updateDto, 1);
  
      expect(result.weight).toEqual(80);
      expect(mockRaportRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        expect.objectContaining({ weight: 80 }),
      );
      expect(mockRaportRepository.findOne).toHaveBeenCalledTimes(2);
    });
  
    it('should throw NotFoundException if raport does not exist', async () => {
      mockRaportRepository.findOne.mockResolvedValue(null);
  
      const updateDto = { weight: 80 };
  
      await expect(raportService.update(1, updateDto, 1)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRaportRepository.update).not.toHaveBeenCalled();
    });
  });
  
  describe('remove', () => {
    it('should remove a raport', async () => {
      mockRaportRepository.findOne.mockResolvedValue(mockRaport);
      mockRaportRepository.remove.mockResolvedValue(mockRaport);
  
      const result = await raportService.remove(1, 1);
  
      expect(result).toEqual(mockRaport);
      expect(mockRaportRepository.remove).toHaveBeenCalledWith(mockRaport);
    });
  
    it('should throw NotFoundException if raport does not exist', async () => {
      mockRaportRepository.findOne.mockResolvedValue(null);
  
      await expect(raportService.remove(1, 1)).rejects.toThrow(NotFoundException);
      expect(mockRaportRepository.remove).not.toHaveBeenCalled();
    });
  }); 
});
