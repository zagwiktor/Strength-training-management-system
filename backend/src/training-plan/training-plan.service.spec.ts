import { TrainingPlanService } from './training-plan.service';
import { UserService } from 'src/user/user.service';
import { TrainingUnitService } from 'src/training-unit/training-unit.service';
import { Repository } from 'typeorm';
import { TrainingPlan } from './entities/training-plan.entity';
import { User } from 'src/user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TrainingPlanService', () => {
  let trainingPlanService: TrainingPlanService;
  let userService: UserService;
  let trainingUnitsService: TrainingUnitService;
  let trainingPlanRepository: Repository<TrainingPlan>;

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
    name: 'Plan 1',
    description: 'Test plan',
    dateCreated: new Date(),
    mainPlan: false,
    author: mockUser,
    raports: [],
    trainingUnits: [],
  };

  const mockTrainingPlanRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockTrainingUnitsService = {
    findByIds: jest.fn(),
  };

  beforeEach(() => {
    trainingPlanRepository = mockTrainingPlanRepository as unknown as Repository<TrainingPlan>;
    userService = mockUserService as unknown as UserService;
    trainingUnitsService = mockTrainingUnitsService as unknown as TrainingUnitService;

    trainingPlanService = new TrainingPlanService(userService, trainingUnitsService, trainingPlanRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new training plan', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockTrainingUnitsService.findByIds.mockResolvedValue([]);
      mockTrainingPlanRepository.save.mockResolvedValue(mockTrainingPlan);

      const createDto = {
        name: 'Plan 1',
        description: 'Test plan',
        mainPlan: true,
        trainingUnitsIds: [],
      };

      const result = await trainingPlanService.create(createDto, 1);

      expect(result).toEqual(expect.objectContaining({
        id: mockTrainingPlan.id,
        name: mockTrainingPlan.name,
        description: mockTrainingPlan.description,
        mainPlan: mockTrainingPlan.mainPlan,
      }));
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockTrainingUnitsService.findByIds).toHaveBeenCalledWith([]);
      expect(mockTrainingPlanRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        trainingPlanService.create({ name: 'Plan 1', description: 'Test plan', mainPlan: true, trainingUnitsIds: [] }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all training plans for a user', async () => {
      mockTrainingPlanRepository.find.mockResolvedValue([mockTrainingPlan]);

      const result = await trainingPlanService.findAll(1);

      expect(result).toEqual([mockTrainingPlan]);
      expect(mockTrainingPlanRepository.find).toHaveBeenCalledWith({
        where: { author: { id: 1 } },
        relations: ['trainingUnits', 'trainingUnits.exercises'],
      });
    });
  });

  describe('findOne', () => {
    it('should return a single training plan', async () => {
      mockTrainingPlanRepository.findOne.mockResolvedValue(mockTrainingPlan);

      const result = await trainingPlanService.findOne(1, 1);

      expect(result).toEqual(mockTrainingPlan);
      expect(mockTrainingPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, author: { id: 1 } },
        relations: ['trainingUnits', 'trainingUnits.exercises'],
      });
    });

    it('should throw NotFoundException if training plan is not found', async () => {
      mockTrainingPlanRepository.findOne.mockResolvedValue(null);

      await expect(trainingPlanService.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a training plan', async () => {
      mockTrainingPlanRepository.findOne.mockResolvedValue(mockTrainingPlan);
      mockTrainingUnitsService.findByIds.mockResolvedValue([]);
      mockTrainingPlanRepository.save.mockResolvedValue({ ...mockTrainingPlan, name: 'Updated Plan' });

      const updateDto = { name: 'Updated Plan', trainingUnitsIds: [], mainPlan: true };

      const result = await trainingPlanService.update(1, updateDto, 1);

      expect(result).toEqual(expect.objectContaining({ name: 'Updated Plan' }));
      expect(mockTrainingPlanRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if training plan does not exist', async () => {
      mockTrainingPlanRepository.findOne.mockResolvedValue(null);

      await expect(trainingPlanService.update(1, { name: 'Updated Plan' }, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a training plan', async () => {
      mockTrainingPlanRepository.findOne.mockResolvedValue(mockTrainingPlan);
      mockTrainingPlanRepository.remove.mockResolvedValue(mockTrainingPlan);

      const result = await trainingPlanService.remove(1, 1);

      expect(result).toEqual(mockTrainingPlan);
      expect(mockTrainingPlanRepository.remove).toHaveBeenCalledWith(mockTrainingPlan);
    });

    it('should throw NotFoundException if training plan does not exist', async () => {
      mockTrainingPlanRepository.findOne.mockResolvedValue(null);

      await expect(trainingPlanService.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
