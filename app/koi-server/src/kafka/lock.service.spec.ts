/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { LockService } from './lock.service';

// Kafka 모킹
jest.mock('kafkajs', () => {
  return {
    Kafka: jest.fn().mockImplementation(() => ({
      consumer: (): { connect: jest.Mock; disconnect: jest.Mock; run: jest.Mock; subscribe: jest.Mock } => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        run: jest.fn(),
        subscribe: jest.fn(),
      }),
      producer: (): { connect: jest.Mock; disconnect: jest.Mock; send: jest.Mock } => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        send: jest.fn(),
      }),
    })),
  };
});

describe('LockService', () => {
  let service: LockService;
  let mockProducer;
  let mockConsumer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LockService,
          useClass: LockService,
        },
      ],
    }).compile();

    service = module.get(LockService);
    await service.onModuleInit();

    mockProducer = (service as any).producer;
    mockConsumer = (service as any).consumer;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('단위 테스트', () => {
    it('락 획득 시도 성공', async () => {
      const resourceId = 'test-resource';
      mockProducer.send.mockResolvedValueOnce({});

      const result = await service.acquireLock(resourceId);

      expect(result).toBeTruthy();
      expect(mockProducer.send).toHaveBeenCalledWith({
        messages: expect.arrayContaining([
          expect.objectContaining({
            key: resourceId,
            value: expect.any(String),
          }),
        ]),
        topic: 'distributed-lock',
      });
    });

    it('타임아웃으로 인한 락 획득 실패', async () => {
      const resourceId = 'test-resource';
      const timeout = 1000;

      mockProducer.send.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, timeout + 500);
        });
      });

      const result = await service.acquireLock(resourceId, timeout);

      expect(result).toBeFalsy();
    });
  });
});
