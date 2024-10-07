import { Test, TestingModule } from '@nestjs/testing';
import { RaportController } from './raport.controller';
import { RaportService } from './raport.service';

describe('RaportController', () => {
  let controller: RaportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RaportController],
      providers: [RaportService],
    }).compile();

    controller = module.get<RaportController>(RaportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
