import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { OutboxService } from '../../../src/outbox/outbox.service';
import { OutboxRepository } from '../../../src/outbox/outbox.repository';
import { OutboxDocument, OutboxEventType, OutboxStatus } from '../../../src/outbox/outbox.schema';

// 목 타입 정의
type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

// 목 팩토리 함수
const mockRepository = (): MockType<OutboxRepository> => ({
  create: jest.fn(),
  findFailedEvents: jest.fn(),
  findPendingEvents: jest.fn(),
  markAsFailed: jest.fn(),
  markAsProcessed: jest.fn(),
});

const mockConnection = (): MockType<Connection> => ({
  startSession: jest.fn(),
});

describe('OutboxService', () => {
  let outboxService: OutboxService;
  let outboxRepository: MockType<OutboxRepository>;

  beforeEach(async () => {
    // Logger 모킹 설정
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboxService,
        {
          provide: OutboxRepository,
          useFactory: mockRepository,
        },
        {
          provide: getConnectionToken(),
          useFactory: mockConnection,
        },
      ],
    }).compile();

    outboxService = module.get<OutboxService>(OutboxService);
    outboxRepository = module.get(OutboxRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('서비스가 정의되어 있어야 함', () => {
    expect(outboxService).toBeDefined();
  });

  describe('createOutboxMessage', () => {
    it('아웃박스 메시지를 생성해야 함', async () => {
      // Given
      const eventType: OutboxEventType = OutboxEventType.STOCK_PURCHASED;
      const payload = { quantity: 10, stockId: '456', userId: '123' };
      const topic = 'stock.transaction.topic';
      const mockOutboxDoc = {
        _id: 'abc123',
        eventType,
        payload: JSON.stringify(payload),
        retryCount: 0,
        status: OutboxStatus.PENDING,
        topic,
      } as unknown as OutboxDocument;

      outboxRepository.create.mockReturnValue(Promise.resolve(mockOutboxDoc));

      // When
      const result = await outboxService.createOutboxMessage(eventType, payload, topic);

      // Then
      expect(outboxRepository.create).toHaveBeenCalledWith(eventType, payload, topic, undefined);
      expect(result).toEqual(mockOutboxDoc);
    });

    it('아웃박스 메시지 생성 시 오류를 처리해야 함', async () => {
      // Given
      const error = new Error('Database connection error');
      outboxRepository.create.mockRejectedValue(error);

      // When/Then
      await expect(outboxService.createOutboxMessage(OutboxEventType.STOCK_PURCHASED, {}, 'topic')).rejects.toThrow(
        error,
      );

      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('getPendingMessages', () => {
    it('대기 중인 메시지를 반환해야 함', async () => {
      // Given
      const mockPendingMessages = [
        { _id: '1', retryCount: 0, status: OutboxStatus.PENDING },
        { _id: '2', retryCount: 0, status: OutboxStatus.PENDING },
      ] as unknown as OutboxDocument[];

      outboxRepository.findPendingEvents.mockReturnValue(Promise.resolve(mockPendingMessages));

      // When
      const result = await outboxService.getPendingMessages(5);

      // Then
      expect(outboxRepository.findPendingEvents).toHaveBeenCalledWith(5);
      expect(result).toEqual(mockPendingMessages);
    });
  });

  describe('updateOutboxStatus', () => {
    it('아웃박스 상태를 처리됨으로 업데이트해야 함', async () => {
      // Given
      const messageId = 'abc123';
      const status: OutboxStatus = OutboxStatus.PROCESSED;
      const mockUpdatedDoc = {
        _id: messageId,
        processedAt: expect.any(Date),
        status,
      } as unknown as OutboxDocument;

      outboxRepository.markAsProcessed.mockReturnValue(Promise.resolve(mockUpdatedDoc));

      // When
      const result = await outboxService.updateOutboxStatus(messageId, status);

      // Then
      expect(outboxRepository.markAsProcessed).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(mockUpdatedDoc);
    });

    it('아웃박스 상태를 실패로 업데이트해야 함', async () => {
      // Given
      const messageId = 'abc123';
      const status: OutboxStatus = OutboxStatus.FAILED;
      const errorMessage = 'Kafka connection error';
      const mockUpdatedDoc = {
        _id: messageId,
        errorMessage,
        retryCount: 1,
        status,
      } as unknown as OutboxDocument;

      outboxRepository.markAsFailed.mockReturnValue(Promise.resolve(mockUpdatedDoc));

      // When
      const result = await outboxService.updateOutboxStatus(messageId, status, errorMessage);

      // Then
      expect(outboxRepository.markAsFailed).toHaveBeenCalledWith(messageId, errorMessage);
      expect(result).toEqual(mockUpdatedDoc);
    });

    it('아웃박스 상태 업데이트 시 오류를 처리해야 함', async () => {
      // Given
      const error = new Error('Database connection error');
      outboxRepository.markAsProcessed.mockRejectedValue(error);

      // When/Then
      await expect(outboxService.updateOutboxStatus('abc123', OutboxStatus.PROCESSED)).rejects.toThrow(error);

      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('getFailedMessages', () => {
    it('실패한 메시지를 반환해야 함', async () => {
      // Given
      const mockFailedMessages = [
        { _id: '1', retryCount: 1, status: OutboxStatus.FAILED },
        { _id: '2', retryCount: 2, status: OutboxStatus.FAILED },
      ] as unknown as OutboxDocument[];

      outboxRepository.findFailedEvents.mockReturnValue(Promise.resolve(mockFailedMessages));

      // When
      const result = await outboxService.getFailedMessages(3);

      // Then
      expect(outboxRepository.findFailedEvents).toHaveBeenCalledWith(3);
      expect(result).toEqual(mockFailedMessages);
    });
  });
});
