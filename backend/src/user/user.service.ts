import { ConflictException, Injectable } from '@nestjs/common';
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

  findAll() {
    return `This action returns all user`;
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
