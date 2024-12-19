import { TrainingUnitService } from './training-unit.service';
import { TrainingUnit } from './entities/training-unit.entity';
import { UserService } from '../user/user.service';
import { ExerciseService } from '../exercise/exercise.service';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Exercise } from '../exercise/entities/exercise.entity';

describe('TrainingUnitService', () => {
  let service: TrainingUnitService;
  let trainingUnitRepository: Repository<TrainingUnit>;
  let userService: UserService;
  let exerciseService: ExerciseService;

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

  const mockExercises: Exercise[] = [
    {
      id: 1,
      name: 'Exercise 1',
      description: 'Description 1',
      sets: 3,
      reps: 10,
      tempo: [2, 1, 2, 1],
      load: 50,
      categories: [], 
      trainingUnits: [], 
      author: {
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
      },
    },
    {
      id: 2,
      name: 'Exercise 2',
      description: 'Description 2',
      sets: 4,
      reps: 12,
      tempo: [3, 1, 3, 1],
      load: 60,
      categories: [],
      trainingUnits: [],
      author: {
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
      },
    },
  ];

  const mockTrainingUnit: TrainingUnit = {
    id: 1,
    name: 'Training Unit 1',
    description: 'Test Description',
    exercises: mockExercises,
    orderedExercises: [
      { order: 0, pkOfExercise: 1 },
      { order: 1, pkOfExercise: 2 },
    ],
    trainingPlan: null,
    author: mockUser,
  };

  const mockRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockExerciseService = {
    findByIds: jest.fn(),
  };

  beforeEach(() => {
    trainingUnitRepository = mockRepository as unknown as Repository<TrainingUnit>;
    userService = mockUserService as unknown as UserService;
    exerciseService = mockExerciseService as unknown as ExerciseService;

    service = new TrainingUnitService(userService, exerciseService, trainingUnitRepository);
  });

  describe('create', () => {
    it('should create a new training unit', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockExerciseService.findByIds.mockResolvedValue(mockExercises);
      mockRepository.save.mockResolvedValue(mockTrainingUnit);

      const result = await service.create(
        { name: 'Training Unit 1', description: 'Test Description', exercises: [1, 2] },
        mockUser.id
      );

      expect(result).toEqual(expect.objectContaining({ name: 'Training Unit 1' }));
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(
        service.create({ name: 'Training Unit 1', description: 'Test Description', exercises: [1, 2] }, mockUser.id)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all training units for a user', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockRepository.find.mockResolvedValue([mockTrainingUnit]);

      const result = await service.findAll(mockUser.id);

      expect(result).toEqual([mockTrainingUnit]);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.findAll(mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a specific training unit', async () => {
      mockRepository.findOne.mockResolvedValue(mockTrainingUnit);

      const result = await service.findOne(1, mockUser.id);

      expect(result).toEqual(mockTrainingUnit);
      expect(mockRepository.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if training unit not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a training unit', async () => {
      const updatedData = { name: 'Updated Training Unit' };
      mockRepository.findOne.mockResolvedValue(mockTrainingUnit);
      mockRepository.save.mockResolvedValue({ ...mockTrainingUnit, ...updatedData });

      const result = await service.update(1, updatedData, mockUser.id);

      expect(result.name).toEqual('Updated Training Unit');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if exercises mismatch', async () => {
      const invalidData = { orderedExercisesUpdated: [{ order: 0, pkOfExercise: 1 }] };
      mockRepository.findOne.mockResolvedValue(mockTrainingUnit);

      await expect(service.update(1, invalidData, mockUser.id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a training unit', async () => {
      mockRepository.findOne.mockResolvedValue(mockTrainingUnit);

      await service.remove(1, mockUser.id);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockTrainingUnit);
    });

    it('should throw NotFoundException if training unit does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1, mockUser.id)).rejects.toThrow(NotFoundException);
    });
  });
});
