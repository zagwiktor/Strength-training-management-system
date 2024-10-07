import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseCategoryController } from './exercise-category.controller';
import { ExerciseCategoryService } from './exercise-category.service';

describe('ExerciseCategoryController', () => {
  let controller: ExerciseCategoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseCategoryController],
      providers: [ExerciseCategoryService],
    }).compile();

    controller = module.get<ExerciseCategoryController>(ExerciseCategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
