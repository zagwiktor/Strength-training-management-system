import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDietDto } from './dto/create-diet.dto';
import { UpdateDietDto } from './dto/update-diet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Diet } from './entities/diet.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DietService {
  constructor(
    @InjectRepository(Diet) private dietRepository: Repository<Diet>,
    private readonly userService: UserService
  ){}
  async create(createDietDto: CreateDietDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const macronutrientsCondition = ((createDietDto.carbohydrates * 4) + 
                                      (createDietDto.protein * 4) 
                                      + (createDietDto.fat * 9) 
                                      === createDietDto.calories)
    if(!macronutrientsCondition) {
      throw new BadRequestException('Calories do not match the sum of macronutrients.');
    }
    const newDiet = new Diet();
    newDiet.author = user;
    newDiet.calories = createDietDto.calories;
    newDiet.carbohydrates = createDietDto.carbohydrates;
    newDiet.description = createDietDto.description;
    newDiet.fat = createDietDto.fat;
    newDiet.name = createDietDto.name;
    newDiet.protein = createDietDto.protein;
    return await this.dietRepository.save(newDiet);
  }

  async findAll(userId: number) {
    const user = await this.userService.findOne(userId);
    if(!user) {
      throw new NotFoundException('User not found');
    }
    const diets = await this.dietRepository.find({where: {author: {id: userId}}});
    return diets;
  }

  async findOne(id: number, userId: number) {
    const diet = await this.dietRepository.findOne({where: {id: id, author: {
      id: userId
    }}});
    if(!diet){ 
      throw new NotFoundException('Diet not found or you are not the author of this diet!');
    }
    return diet;
  }

  async update(id: number, updateDietDto: UpdateDietDto, userId: number) {
    await this.findOne(id, userId);
    return await this.dietRepository.update({id}, updateDietDto);
  }

  async remove(id: number, userId: number) {
    const diet = await this.findOne(id, userId);
    return await this.dietRepository.remove(diet);
  }
}
