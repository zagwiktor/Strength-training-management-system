import { Test, TestingModule } from '@nestjs/testing';
import { TrainingUnitService } from './training-unit.service';

describe('TrainingUnitService', () => {
  let service: TrainingUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingUnitService],
    }).compile();

    service = module.get<TrainingUnitService>(TrainingUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
