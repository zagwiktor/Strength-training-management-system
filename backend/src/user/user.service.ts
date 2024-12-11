import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>
  ){}
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const user = new User();
    user.email = createUserDto.email;
    user.gender = createUserDto.gender;
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(createUserDto.password, salt);
    user.name = createUserDto.name;
    user.surname = createUserDto.surname;
    user.weight = createUserDto.weight;
    user.height = createUserDto.height;
    const savedUser = await this.userRepository.save(user);
    return plainToInstance(User, savedUser);
  }

  async findOne(user: string | number): Promise<User | null>  {
    if (typeof user === 'string') {
      return await this.userRepository.findOne({
        where: { email: user },
      });
    } else {
      return await this.userRepository.findOneBy({ id: user });
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
  
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (updateUserDto.email) {
      const emailTaken = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
      if (emailTaken && emailTaken.id !== id) {
        throw new ConflictException('Email already exists');
      }
      existingUser.email = updateUserDto.email;
    }
    if (updateUserDto.name) {
      existingUser.name = updateUserDto.name;
    }
    if (updateUserDto.surname) {
      existingUser.surname = updateUserDto.surname;
    }
    if (updateUserDto.gender) {
      existingUser.gender = updateUserDto.gender;
    }
    if (updateUserDto.weight !== undefined) {
      existingUser.weight = updateUserDto.weight;
    }
    if (updateUserDto.height !== undefined) {
      existingUser.height = updateUserDto.height;
    }
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      existingUser.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    const updatedUser = await this.userRepository.save(existingUser);
    return plainToInstance(User, updatedUser);
  }
  
  async remove(id: number): Promise<string> {
    const existingUser = await this.userRepository.findOne({ where: { id } });
  
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    await this.userRepository.remove(existingUser);
    return `User with ID ${id} has been removed`;
  }
}
