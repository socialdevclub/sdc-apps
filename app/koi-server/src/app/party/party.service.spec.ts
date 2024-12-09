import { Test, TestingModule } from '@nestjs/testing';
import { PartyService } from './party.service';

describe('PartyService', () => {
  let service: PartyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PartyService],
    }).compile();

    service = module.get<PartyService>(PartyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
