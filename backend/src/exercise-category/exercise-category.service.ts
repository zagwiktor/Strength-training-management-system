import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseCategoryDto } from './dto/create-exercise-category.dto';
import { UpdateExerciseCategoryDto } from './dto/update-exercise-category.dto';
import { UserService } from 'src/user/user.service';
import { ExerciseCategory } from './entities/exercise-category.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ExerciseCategoryService {
  constructor(
    private readonly userService: UserService,
    @InjectRepository(ExerciseCategory) private categoryRepository: Repository<ExerciseCategory>
  ) {}

  async create(createExerciseCategoryDto: CreateExerciseCategoryDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const newCategory = new ExerciseCategory();
    newCategory.author = user;
    newCategory.name = createExerciseCategoryDto.name;
    return await this.categoryRepository.save(newCategory);
  }

  async findAll(userId: number) {
    const categories = await this.categoryRepository.find({where: {author: {id: userId}}});
    return categories;
  }
  
  async findByIds(categoriesIds: number[]): Promise<ExerciseCategory[]>{
    if (!categoriesIds || categoriesIds.length === 0) {
      return []; 
    }
    const categories = await this.categoryRepository.find(
      {where: {
        id: In(categoriesIds)
      }});
    if(categoriesIds.length !== categories.length){
      throw new NotFoundException('Some categories not found');
    }
    return categories;
  }

  async findOne(id: number, userId: number) {
    const category = await this.categoryRepository.findOne({
      where: {id: id, author: {
        id: userId}}
      });
    if(!category){
      throw new NotFoundException('Category not found or you are not the author of this category!');
    }
    return category;
  }

  async update(id: number, updateExerciseCategoryDto: UpdateExerciseCategoryDto, userId: number) {
    await this.findOne(id, userId);
    return await this.categoryRepository.update({id}, updateExerciseCategoryDto);
  }
  
  async remove(id: number, userId: number) {
    const category = await this.findOne(id, userId);
    return await this.categoryRepository.remove(category);
  }
}
