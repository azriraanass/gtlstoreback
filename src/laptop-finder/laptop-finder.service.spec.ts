import { Test, TestingModule } from '@nestjs/testing';
import { LaptopFinderService } from './laptop-finder.service';

describe('LaptopFinderService', () => {
  let service: LaptopFinderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LaptopFinderService],
    }).compile();

    service = module.get<LaptopFinderService>(LaptopFinderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
