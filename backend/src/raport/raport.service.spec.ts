import { Test, TestingModule } from '@nestjs/testing';
import { RaportService } from './raport.service';

describe('RaportService', () => {
  let service: RaportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RaportService],
    }).compile();

    service = module.get<RaportService>(RaportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
