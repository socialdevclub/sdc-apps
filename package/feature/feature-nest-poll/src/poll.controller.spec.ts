import { Test, TestingModule } from '@nestjs/testing';
import { PollController } from './poll.controller';

describe('PollController', () => {
  let controller: PollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PollController],
    }).compile();

    controller = module.get<PollController>(PollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
