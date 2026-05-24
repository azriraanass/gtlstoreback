import { Test, TestingModule } from '@nestjs/testing';
import { LaptopFinderController } from './laptop-finder.controller';

describe('LaptopFinderController', () => {
  let controller: LaptopFinderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LaptopFinderController],
    }).compile();

    controller = module.get<LaptopFinderController>(LaptopFinderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
