import { Test, TestingModule } from '@nestjs/testing';
import { PollService } from './poll.service';

describe('PollService', () => {
  let service: PollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PollService],
    }).compile();

    service = module.get<PollService>(PollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
