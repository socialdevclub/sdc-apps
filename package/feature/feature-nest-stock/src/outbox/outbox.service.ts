import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, QueryOptions } from 'mongoose';
import { OutboxRepository } from './outbox.repository';
import { OutboxDocument, OutboxEventType, OutboxStatus } from './outbox.schema';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  /**
   * 아웃박스 메시지를 생성합니다.
   * @param eventType 이벤트 타입
   * @param payload 메시지 페이로드
   * @param topic Kafka 토픽
   * @param options Mongoose 쿼리 옵션 (트랜잭션 세션 등)
   */
  async createOutboxMessage(
    eventType: OutboxEventType,
    payload: unknown,
    topic: string,
    options?: QueryOptions,
  ): Promise<OutboxDocument> {
    try {
      return await this.outboxRepository.create(eventType, payload, topic, options);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to create outbox message: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * 특정 아웃박스 메시지의 상태를 업데이트합니다.
   * @param id 아웃박스 메시지 ID
   * @param status 새로운 상태
   * @param errorMessage 에러 메시지 (실패 시)
   */
  async updateOutboxStatus(
    id: string,
    status: OutboxStatus,
    errorMessage?: string,
  ): Promise<OutboxDocument | undefined> {
    try {
      if (status === OutboxStatus.PROCESSED) {
        return await this.outboxRepository.markAsProcessed(id);
      }
      if (status === OutboxStatus.FAILED) {
        return await this.outboxRepository.markAsFailed(id, errorMessage);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to update outbox status: ${errorMessage}`, errorStack);
      throw error;
    }
    return undefined;
  }

  /**
   * 처리되지 않은 아웃박스 메시지를 조회합니다.
   * @param limit 최대 조회 개수
   */
  async getPendingMessages(limit = 10): Promise<OutboxDocument[]> {
    try {
      return await this.outboxRepository.findPendingEvents(limit);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get pending messages: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  /**
   * 실패한 아웃박스 메시지를 조회합니다.
   * @param maxRetries 최대 재시도 횟수
   */
  async getFailedMessages(maxRetries = 3): Promise<OutboxDocument[]> {
    try {
      return await this.outboxRepository.findFailedEvents(maxRetries);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get failed messages: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
