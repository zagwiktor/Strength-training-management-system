import { ExerciseService } from './exercise.service';
import { Exercise } from './entities/exercise.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { ExerciseCategoryService } from 'src/exercise-category/exercise-category.service';
import { User } from 'src/user/entities/user.entity';
import { ExerciseCategory } from 'src/exercise-category/entities/exercise-category.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';

describe('ExerciseService', () => {
  let exerciseService: ExerciseService;
  let exerciseRepository: Repository<Exercise>;
  let userService: UserService;
  let categoryService: ExerciseCategoryService;

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

  const mockCategory: ExerciseCategory = {
    id: 1,
    name: 'Strength',
    author: mockUser,
    exercises: [],
  };

  const mockExercise: Exercise = {
    id: 1,
    name: 'Squat',
    description: 'A basic squat exercise',
    sets: 3,
    reps: 10,
    tempo: [2, 0, 1, 0],
    load: 100,
    categories: [mockCategory],
    author: mockUser,
    trainingUnits: [],
  };

  const mockExerciseRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  const mockCategoryService = {
    findByIds: jest.fn(),
  };

  beforeEach(() => {
    exerciseRepository = mockExerciseRepository as unknown as Repository<Exercise>;
    userService = mockUserService as unknown as UserService;
    categoryService = mockCategoryService as unknown as ExerciseCategoryService;

    exerciseService = new ExerciseService(userService, categoryService, exerciseRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new exercise', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockCategoryService.findByIds.mockResolvedValue([mockCategory]);
      mockExerciseRepository.save.mockResolvedValue(mockExercise);
  
      const createDto = {
        name: 'Squat',
        description: 'A basic squat exercise',
        sets: 3,
        reps: 10,
        tempo: [2, 0, 1, 0] as [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number],
        load: 100,
        categories: [1],
      };
  
      const result = await exerciseService.create(createDto, 1);
  
      expect(result).toEqual(expect.objectContaining({
        id: mockExercise.id,
        name: mockExercise.name,
        sets: mockExercise.sets,
        reps: mockExercise.reps,
      }));
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockCategoryService.findByIds).toHaveBeenCalledWith([1]);
      expect(mockExerciseRepository.save).toHaveBeenCalled();
    });
  
    it('should throw NotFoundException if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);
  
      const createDto = {
        name: 'Squat',
        description: 'A basic squat exercise',
        sets: 3,
        reps: 10,
        tempo: [2, 0, 1, 0] as [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number],
        load: 100,
        categories: [1],
      };
  
      await expect(exerciseService.create(createDto, 1)).rejects.toThrow(NotFoundException);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockCategoryService.findByIds).not.toHaveBeenCalled();
      expect(mockExerciseRepository.save).not.toHaveBeenCalled();
    });
  
    it('should throw NotFoundException if categories are not found', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockCategoryService.findByIds.mockRejectedValue(new NotFoundException('Categories not found'));
  
      const createDto = {
        name: 'Squat',
        description: 'A basic squat exercise',
        sets: 3,
        reps: 10,
        tempo: [2, 0, 1, 0] as [eccentricPhase: number, ePause: number, concentricPhases: number, cPause: number],
        load: 100,
        categories: [1],
      };
  
      await expect(exerciseService.create(createDto, 1)).rejects.toThrow(NotFoundException);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockCategoryService.findByIds).toHaveBeenCalledWith([1]);
      expect(mockExerciseRepository.save).not.toHaveBeenCalled();
    });
  
    it('should throw BadRequestException for invalid tempo', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockCategoryService.findByIds.mockResolvedValue([mockCategory]);
  
      const createDto = {
        name: 'Squat',
        description: 'A basic squat exercise',
        sets: 3,
        reps: 10,
        tempo: [2, 0], 
        load: 100,
        categories: [1],
      } as unknown as CreateExerciseDto;
  
      await expect(exerciseService.create(createDto, 1)).rejects.toThrow(BadRequestException);
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockCategoryService.findByIds).not.toHaveBeenCalled();
      expect(mockExerciseRepository.save).not.toHaveBeenCalled();
    });
  });
  

  describe('findByIds', () => {
    it('should return exercises by IDs', async () => {
      mockExerciseRepository.find.mockResolvedValue([mockExercise]);

      const result = await exerciseService.findByIds([1]);

      expect(result).toEqual([mockExercise]);
      expect(mockExerciseRepository.find).toHaveBeenCalledWith({ where: { id: expect.anything() } });
    });

    it('should throw NotFoundException if some exercises are not found', async () => {
      mockExerciseRepository.find.mockResolvedValue([]);

      await expect(exerciseService.findByIds([1])).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return an exercise by ID', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);

      const result = await exerciseService.findOne(1, 1);

      expect(result).toEqual(mockExercise);
      expect(mockExerciseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, author: { id: 1 } },
        relations: ['categories'],
      });
    });

    it('should throw NotFoundException if exercise is not found', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);

      await expect(exerciseService.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);
      mockExerciseRepository.update.mockResolvedValue({ affected: 1 });

      const updateDto = { name: 'Updated Squat' };

      const result = await exerciseService.update(1, updateDto, 1);

      expect(result).toEqual(mockExercise);
      expect(mockExerciseRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if exercise does not exist', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);

      await expect(exerciseService.update(1, { name: 'Updated Squat' }, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an exercise', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(mockExercise);
      mockExerciseRepository.remove.mockResolvedValue(mockExercise);

      const result = await exerciseService.remove(1, 1);

      expect(result).toEqual(mockExercise);
      expect(mockExerciseRepository.remove).toHaveBeenCalledWith(mockExercise);
    });

    it('should throw NotFoundException if exercise does not exist', async () => {
      mockExerciseRepository.findOne.mockResolvedValue(null);

      await expect(exerciseService.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
