import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OutboxProcessor } from '../../../src/outbox/outbox.processor';
import { OutboxService } from '../../../src/outbox/outbox.service';
import { KafkaService } from '../../../src/kafka/kafka.service';
import { OutboxDocument, OutboxEventType, OutboxStatus } from '../../../src/outbox/outbox.schema';

// 목 타입 정의
type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

// 목 팩토리 함수
const mockOutboxService = (): MockType<OutboxService> => ({
  getFailedMessages: jest.fn(),
  getPendingMessages: jest.fn(),
  updateOutboxStatus: jest.fn(),
});

const mockKafkaService = (): MockType<KafkaService> => ({
  sendMessage: jest.fn(),
});

describe('OutboxProcessor', () => {
  let outboxProcessor: OutboxProcessor;
  let outboxService: MockType<OutboxService>;
  let kafkaService: MockType<KafkaService>;

  beforeEach(async () => {
    // Logger 모킹 설정
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxProcessor,
        {
          provide: OutboxService,
          useFactory: mockOutboxService,
        },
        {
          provide: KafkaService,
          useFactory: mockKafkaService,
        },
      ],
    }).compile();

    outboxProcessor = module.get<OutboxProcessor>(OutboxProcessor);
    outboxService = module.get(OutboxService);
    kafkaService = module.get(KafkaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('프로세서가 정의되어 있어야 함', () => {
    expect(outboxProcessor).toBeDefined();
  });

  describe('processOutboxMessages', () => {
    it('대기 중인 메시지를 처리해야 함', async () => {
      // Given
      const mockPendingMessages = [
        {
          _id: '1',
          eventType: OutboxEventType.STOCK_PURCHASED,
          payload: JSON.stringify({ stockId: '456', userId: '123' }),
          retryCount: 0,
          status: OutboxStatus.PENDING,
          topic: 'stock.topic',
        },
      ] as unknown as OutboxDocument[];

      outboxService.getPendingMessages.mockReturnValue(Promise.resolve(mockPendingMessages));
      kafkaService.sendMessage.mockReturnValue(Promise.resolve());
      outboxService.updateOutboxStatus.mockReturnValue(Promise.resolve({} as OutboxDocument));

      // When
      await outboxProcessor.processOutboxMessages();

      // Then
      expect(outboxService.getPendingMessages).toHaveBeenCalledWith(10);
      expect(kafkaService.sendMessage).toHaveBeenCalledWith(
        mockPendingMessages[0].topic,
        mockPendingMessages[0].payload,
      );
      expect(outboxService.updateOutboxStatus).toHaveBeenCalledWith(mockPendingMessages[0]._id, OutboxStatus.PROCESSED);
    });

    it('메시지 처리 시 오류를 처리해야 함', async () => {
      // Given
      const mockPendingMessages = [
        {
          _id: '1',
          eventType: OutboxEventType.STOCK_PURCHASED,
          payload: JSON.stringify({ stockId: '456', userId: '123' }),
          retryCount: 0,
          status: OutboxStatus.PENDING,
          topic: 'stock.topic',
        },
      ] as unknown as OutboxDocument[];

      const error = new Error('Kafka connection error');
      outboxService.getPendingMessages.mockReturnValue(Promise.resolve(mockPendingMessages));
      kafkaService.sendMessage.mockRejectedValue(error);
      outboxService.updateOutboxStatus.mockReturnValue(Promise.resolve({} as OutboxDocument));

      // When
      await outboxProcessor.processOutboxMessages();

      // Then
      expect(outboxService.updateOutboxStatus).toHaveBeenCalledWith(
        mockPendingMessages[0]._id,
        OutboxStatus.FAILED,
        error.message,
      );
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('retryFailedMessages', () => {
    it('실패한 메시지를 재시도해야 함', async () => {
      // Given
      const mockFailedMessages = [
        {
          _id: '1',
          eventType: OutboxEventType.STOCK_PURCHASED,
          payload: JSON.stringify({ stockId: '456', userId: '123' }),
          retryCount: 1,
          status: OutboxStatus.FAILED,
          topic: 'stock.topic',
        },
      ] as unknown as OutboxDocument[];

      outboxService.getFailedMessages.mockReturnValue(Promise.resolve(mockFailedMessages));
      kafkaService.sendMessage.mockReturnValue(Promise.resolve());
      outboxService.updateOutboxStatus.mockReturnValue(Promise.resolve({} as OutboxDocument));

      // When
      await outboxProcessor.retryFailedMessages();

      // Then
      expect(outboxService.getFailedMessages).toHaveBeenCalledWith(3);
      expect(kafkaService.sendMessage).toHaveBeenCalledWith(mockFailedMessages[0].topic, mockFailedMessages[0].payload);
      expect(outboxService.updateOutboxStatus).toHaveBeenCalledWith(mockFailedMessages[0]._id, OutboxStatus.PROCESSED);
    });

    it('실패한 메시지 재시도 시 오류를 처리해야 함', async () => {
      // Given
      const mockFailedMessages = [
        {
          _id: '1',
          eventType: OutboxEventType.STOCK_PURCHASED,
          payload: JSON.stringify({ stockId: '456', userId: '123' }),
          retryCount: 1,
          status: OutboxStatus.FAILED,
          topic: 'stock.topic',
        },
      ] as unknown as OutboxDocument[];

      const error = new Error('Kafka connection error');
      outboxService.getFailedMessages.mockReturnValue(Promise.resolve(mockFailedMessages));
      kafkaService.sendMessage.mockRejectedValue(error);
      outboxService.updateOutboxStatus.mockReturnValue(Promise.resolve({} as OutboxDocument));

      // When
      await outboxProcessor.retryFailedMessages();

      // Then
      expect(outboxService.updateOutboxStatus).toHaveBeenCalledWith(
        mockFailedMessages[0]._id,
        OutboxStatus.FAILED,
        error.message,
      );
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
});
