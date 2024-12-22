import { ExerciseCategoryService } from './exercise-category.service';
import { UserService } from 'src/user/user.service';
import { In, Repository } from 'typeorm';
import { ExerciseCategory } from './entities/exercise-category.entity';
import { User } from 'src/user/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('ExerciseCategoryService', () => {
  let categoryService: ExerciseCategoryService;
  let categoryRepository: Repository<ExerciseCategory>;
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

  const mockCategory: ExerciseCategory = {
    id: 1,
    name: 'Strength',
    author: mockUser,
    exercises: [],
  };

  const mockCategoryRepository = {
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
    categoryRepository = mockCategoryRepository as unknown as Repository<ExerciseCategory>;
    userService = mockUserService as unknown as UserService;

    categoryService = new ExerciseCategoryService(userService, categoryRepository);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockCategoryRepository.save.mockResolvedValue(mockCategory);
      
      const createDto = { name: 'Strength' };
      
      const result = await categoryService.create(createDto, 1);
      
      expect(result).toEqual(expect.objectContaining({
        id: mockCategory.id,
        name: mockCategory.name,
      }));
      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Strength' }));
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(categoryService.create({ name: 'Strength' }, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all categories for a user', async () => {
      mockCategoryRepository.find.mockResolvedValue([mockCategory]);

      const result = await categoryService.findAll(1);

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({ where: { author: { id: 1 } } });
    });
  });

  describe('findByIds', () => {
    it('should return categories by IDs', async () => {
      mockCategoryRepository.find.mockResolvedValue([mockCategory]);

      const result = await categoryService.findByIds([1]);

      expect(result).toEqual([mockCategory]);
      expect(mockCategoryRepository.find).toHaveBeenCalledWith({ where: { id: In([1]) } });
    });

    it('should throw NotFoundException if some categories are missing', async () => {
      mockCategoryRepository.find.mockResolvedValue([]);

      await expect(categoryService.findByIds([1])).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a category by ID and user', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);

      const result = await categoryService.findOne(1, 1);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, author: { id: 1 } },
      });
    });

    it('should throw NotFoundException if category is not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(categoryService.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto = { name: 'Updated Name' };
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.update.mockResolvedValue({ affected: 1 });
      mockCategoryRepository.findOne.mockResolvedValue({ ...mockCategory, name: 'Updated Name' });

      const result = await categoryService.update(1, updateDto, 1);

      expect(result).toEqual({ ...mockCategory, name: 'Updated Name' });
      expect(mockCategoryRepository.update).toHaveBeenCalledWith({ id: 1 }, updateDto);
    });

    it('should throw NotFoundException if category is not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(categoryService.update(1, { name: 'Updated Name' }, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockCategoryRepository.remove.mockResolvedValue(mockCategory);

      const result = await categoryService.remove(1, 1);

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(mockCategory);
    });

    it('should throw NotFoundException if category is not found', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(categoryService.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});
