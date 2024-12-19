import { DietService } from './diet.service';
import { Diet } from './entities/diet.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

describe('DietService', () => {
  let dietService: DietService;
  let dietRepository: Repository<Diet>;
  let userService: UserService;

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

  const mockDiet: Diet = {
    id: 1,
    calories: 1700,
    protein: 100,
    fat: 100,
    carbohydrates: 100,
    author: mockUser,
  };

  const mockDietRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    dietRepository = mockDietRepository as unknown as Repository<Diet>;
    userService = mockUserService as unknown as UserService;
    dietService = new DietService(dietRepository, userService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new diet', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDietRepository.save.mockResolvedValue(mockDiet);

      const createDietDto = {
        calories: 1700,
        protein: 100,
        fat: 100,
        carbohydrates: 100,
      };

      const result = await dietService.create(createDietDto, 1);

      expect(result).toEqual({
        id: mockDiet.id,
        calories: mockDiet.calories,
        protein: mockDiet.protein,
        fat: mockDiet.fat,
        carbohydrates: mockDiet.carbohydrates,
      });
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockDietRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if calories do not match macronutrients', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const createDietDto = {
        calories: 2000,
        protein: 150,
        fat: 50,
        carbohydrates: 100, 
      };

      await expect(dietService.create(createDietDto, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockDietRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all diets for a user', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDietRepository.find.mockResolvedValue([mockDiet]);

      const result = await dietService.findAll(1);

      expect(result).toEqual([mockDiet]);
      expect(mockDietRepository.find).toHaveBeenCalledWith({
        where: { author: { id: 1 } },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(dietService.findAll(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a single diet', async () => {
      mockDietRepository.findOne.mockResolvedValue(mockDiet);

      const result = await dietService.findOne(1, 1);

      expect(result).toEqual(mockDiet);
      expect(mockDietRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, author: { id: 1 } },
      });
    });

    it('should throw NotFoundException if diet is not found', async () => {
      mockDietRepository.findOne.mockResolvedValue(null);

      await expect(dietService.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing diet', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDietRepository.findOne.mockResolvedValue(mockDiet);
      mockDietRepository.update.mockResolvedValue({ affected: 1 });

      const updateDietDto = {
        calories: 1700,
        protein: 100,
        fat: 100,
        carbohydrates: 100,
      };

      mockDietRepository.findOne.mockResolvedValue({
        ...mockDiet,
        ...updateDietDto,
      });

      const result = await dietService.update(1, updateDietDto, 1);

      expect(result).toEqual({
        ...mockDiet,
        ...updateDietDto,
      });
      expect(mockDietRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        updateDietDto,
      );
    });

    it('should throw BadRequestException if calories do not match macronutrients', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockDietRepository.findOne.mockResolvedValue(mockDiet);

      const updateDietDto = {
        calories: 1800,
        protein: 150,
        fat: 40,
        carbohydrates: 100, 
      };

      await expect(dietService.update(1, updateDietDto, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDietRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an existing diet', async () => {
      mockDietRepository.findOne.mockResolvedValue(mockDiet);
      mockDietRepository.remove.mockResolvedValue(mockDiet);

      const result = await dietService.remove(1, 1);

      expect(result).toEqual(mockDiet);
      expect(mockDietRepository.remove).toHaveBeenCalledWith(mockDiet);
    });

    it('should throw NotFoundException if diet does not exist', async () => {
      mockDietRepository.findOne.mockResolvedValue(null);
      
      await expect(dietService.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
