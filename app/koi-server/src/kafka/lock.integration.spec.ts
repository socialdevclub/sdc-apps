/* eslint-disable @typescript-eslint/no-explicit-any */

import { Test, TestingModule } from '@nestjs/testing';
import { LockService } from './lock.service';
import { LockController } from './example.controller';

describe('Lock Integration Tests', () => {
  let lockService: LockService;
  let lockController: LockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LockController],
      imports: [],
      providers: [
        LockService,
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    lockService = module.get<LockService>(LockService);
    lockController = module.get<LockController>(LockController);
    await lockService.onModuleInit();
  });

  describe('동시성 테스트', () => {
    it('여러 요청의 동시 처리 테스트', async () => {
      const resourceId = 'concurrent-test';
      const numberOfRequests = 5;

      // 여러 개의 동시 요청 생성
      const requests = Array(numberOfRequests)
        .fill(null)
        .map(() =>
          lockController.processWithLock({
            data: { test: 'data' },
            resourceId,
          }),
        );

      // 모든 요청 실행
      const results = await Promise.all(requests);

      // 결과 검증
      const successCount = results.filter((r) => r.success).length;
      expect(successCount).toBe(1); // 하나의 요청만 성공해야 함
      expect(results.filter((r) => !r.success).length).toBe(numberOfRequests - 1);
    });

    it('락 해제 후 다른 요청 처리 가능', async () => {
      const resourceId = 'sequential-test';

      // 첫 번째 요청
      const firstResult = await lockController.processWithLock({
        data: { test: 'first' },
        resourceId,
      });

      // 첫 번째 요청 완료 대기 (락 해제 포함)
      await new Promise((resolve) => {
        setTimeout(resolve, 1500);
      });

      // 두 번째 요청
      const secondResult = await lockController.processWithLock({
        data: { test: 'second' },
        resourceId,
      });

      expect(firstResult.success).toBeTruthy();
      expect(secondResult.success).toBeTruthy();
    });
  });
});

// 실제 Kafka를 사용한 E2E 테스트
describe('Lock E2E Tests', () => {
  let lockService1: LockService;
  let lockService2: LockService;

  beforeAll(async () => {
    // 실제 Kafka 연결 설정
    process.env.KAFKA_BROKERS = 'localhost:9092';

    // 두 개의 독립적인 서비스 인스턴스 생성
    lockService1 = new LockService();
    lockService2 = new LockService();

    await Promise.all([lockService1.onModuleInit(), lockService2.onModuleInit()]);
  });

  afterAll(async () => {
    // 연결 종료
    await Promise.all([
      (lockService1 as any).producer.disconnect(),
      (lockService1 as any).consumer.disconnect(),
      (lockService2 as any).producer.disconnect(),
      (lockService2 as any).consumer.disconnect(),
    ]);
  });

  it('서로 다른 노드 간의 락 동기화', async () => {
    const resourceId = 'e2e-test';

    // 첫 번째 노드에서 락 획득
    const lock1 = await lockService1.acquireLock(resourceId);
    expect(lock1).toBeTruthy();

    // 두 번째 노드에서 락 획득 시도
    const lock2 = await lockService2.acquireLock(resourceId);
    expect(lock2).toBeFalsy();

    // 첫 번째 노드에서 락 해제
    await lockService1.releaseLock(resourceId);

    // 잠시 대기 후 두 번째 노드에서 다시 시도
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    const lock2Retry = await lockService2.acquireLock(resourceId);
    expect(lock2Retry).toBeTruthy();
  });
});
