import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

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

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    userRepository = mockUserRepository as unknown as Repository<User>;
    userService = new UserService(userRepository);

    jest.clearAllMocks(); 
  });

  describe('create', () => {
    it('should create a new user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const createUserDto = {
        email: mockUser.email,
        password: 'password',
        name: mockUser.name,
        surname: mockUser.surname,
        gender: mockUser.gender,
        weight: mockUser.weight,
        height: mockUser.height,
      };

      const result = await userService.create(createUserDto);

      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        surname: mockUser.surname,
        gender: mockUser.gender,
        weight: mockUser.weight,
        height: mockUser.height,
      }));
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(
        userService.create({
          email: mockUser.email,
          password: 'password',
          name: 'New Name',
          surname: 'New Surname',
          gender: 'Male',
          weight: 70,
          height: 175,
        }),
      ).rejects.toThrow(ConflictException);

      expect(userRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userService.findOne(mockUser.email);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: mockUser.email } });
    });

    it('should return a user by ID', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);

      const result = await userService.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: mockUser.id });
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
      };
  
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('salt');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword');
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);
  
      const result = await userService.update(mockUser.id, { name: 'Updated Name', password: 'newPassword' });
  
      expect(result).toEqual(expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        name: 'Updated Name',
        surname: mockUser.surname,
        gender: mockUser.gender,
        weight: mockUser.weight,
        height: mockUser.height,
        diet: null,
        exercisesCategories: [],
        exercises: [],
        traningPlans: [],
        raports: [],
        trainingUnits: [],
      }));
  
      expect(userRepository.save).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Name' }));
    });
  
    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
  
      await expect(userService.update(999, { name: 'Updated Name' })).rejects.toThrow(NotFoundException);
    });
  });
});
