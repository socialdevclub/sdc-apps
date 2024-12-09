import { Test, TestingModule } from '@nestjs/testing';
import { ResultService } from './result.service';

describe('ResultService', () => {
  let service: ResultService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResultService],
    }).compile();

    service = module.get<ResultService>(ResultService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
