import { Test, TestingModule } from '@nestjs/testing';
import { TrainingUnitController } from './training-unit.controller';
import { TrainingUnitService } from './training-unit.service';

describe('TrainingUnitController', () => {
  let controller: TrainingUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingUnitController],
      providers: [TrainingUnitService],
    }).compile();

    controller = module.get<TrainingUnitController>(TrainingUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
