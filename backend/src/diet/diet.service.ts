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
    const macronutrientsCondition = Math.abs(
      (createDietDto.carbohydrates * 4) +
      (createDietDto.protein * 4) +
      (createDietDto.fat * 9) -
      createDietDto.calories
    ) <= 50;
    if(!macronutrientsCondition) {
      throw new BadRequestException('Calories do not match the sum of macronutrients.');
    }
    const newDiet = new Diet();
    newDiet.author = user;
    newDiet.calories = createDietDto.calories;
    newDiet.carbohydrates = createDietDto.carbohydrates;
    newDiet.fat = createDietDto.fat;
    newDiet.protein = createDietDto.protein;
    const result = await this.dietRepository.save(newDiet);
    const {author, ...diet} = result;
    return diet;
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
    const existingDiet = await this.findOne(id, userId);
    if (!existingDiet) {
        throw new NotFoundException(`Diet with id ${id} not found`);
    }
    const user = await this.userService.findOne(userId);
    if (!user) {
        throw new NotFoundException('User not found');
    }
    const macronutrientsCondition = ((updateDietDto.carbohydrates * 4) + 
                                      (updateDietDto.protein * 4) +
                                      (updateDietDto.fat * 9) === updateDietDto.calories);

    if (!macronutrientsCondition) {
        throw new BadRequestException('Calories do not match the sum of macronutrients.');
    }
    await this.dietRepository.update({ id }, { ...updateDietDto });
    return await this.findOne(id, userId);
  }


  async remove(id: number, userId: number) {
    const diet = await this.findOne(id, userId);
    return await this.dietRepository.remove(diet);
  }
}
