import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, QueryOptions } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { OutboxRepository } from './outbox.repository';
import { OutboxDocument, OutboxEventType, OutboxStatus } from './outbox.schema';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class OutboxService {
  private readonly logger = new Logger(OutboxService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly outboxRepository: OutboxRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  /**
   * 아웃박스 메시지를 생성합니다 (메시지 저장만 담당, 전송은 완전 비동기로 처리).
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
      // 아웃박스 메시지 저장만 실행 (트랜잭션 락 최소화)
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

  /**
   * 배치 사이즈를 기반으로 메시지를 처리하는 필수 매개변수를 가진 메소드
   * @param batchSize 한 번에 처리할 메시지 수
   */
  private async processMessages(batchSize: number): Promise<void> {
    // 처리 대기 중인 메시지 조회
    const pendingMessages = await this.getPendingMessages(batchSize);

    if (pendingMessages.length === 0) {
      return;
    }

    this.logger.log(`처리할 메시지 ${pendingMessages.length}개 발견`);

    // 토픽별로 메시지 그룹화
    const messagesByTopic: Record<string, Array<{ message: OutboxDocument; kafkaMessage: unknown }>> = {};

    // 메시지 준비 및 그룹화
    pendingMessages.forEach((message) => {
      try {
        const kafkaMessage = {
          eventType: message.eventType,
          messageId: message._id.toString(),
          payload: JSON.parse(message.payload as string),
          timestamp: new Date().toISOString(),
        };

        // 토픽별로 메시지 그룹화
        if (!messagesByTopic[message.topic]) {
          messagesByTopic[message.topic] = [];
        }
        messagesByTopic[message.topic].push({ kafkaMessage, message });
      } catch (error) {
        // JSON 파싱 에러 등 전처리 실패 시 바로 실패 처리
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        this.logger.error(`메시지 전처리 실패 (ID: ${message._id}): ${errorMessage}`);
        this.updateOutboxStatus(message._id.toString(), OutboxStatus.FAILED, errorMessage);
      }
    });

    // 토픽별로 배치 처리
    const topicPromises = Object.entries(messagesByTopic).map(async ([topic, items]) => {
      // 카프카 메시지 배열 및 메시지 ID 매핑
      const kafkaMessages = items.map((item) => item.kafkaMessage);
      const messageIds = items.map((item) => item.message._id.toString());

      try {
        // 배치 처리 사용
        await this.kafkaService.sendBatchMessages(topic, kafkaMessages);

        // 성공한 메시지들 상태 업데이트
        const updatePromises = messageIds.map((id) => this.updateOutboxStatus(id, OutboxStatus.PROCESSED));
        await Promise.all(updatePromises);

        this.logger.debug(`[${topic}] ${messageIds.length}개 메시지 배치 전송 성공`);
        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        const errorStack = error instanceof Error ? error.stack : undefined;
        // 배치 전송 실패 시, 개별 메시지 전송 시도 (회복성 증가)
        this.logger.warn(`[${topic}] 배치 전송 실패, 개별 전송 시도 중: ${errorMessage}`, errorStack);

        // 개별 메시지 전송 시도
        const individualPromises = items.map(async ({ message, kafkaMessage }) => {
          try {
            await this.kafkaService.sendMessage(topic, kafkaMessage);
            await this.updateOutboxStatus(message._id.toString(), OutboxStatus.PROCESSED);
            this.logger.debug(`개별 전송 성공: ${message.eventType}, ID: ${message._id}`);
            return true;
          } catch (innerError) {
            const errorMessage = innerError instanceof Error ? innerError.message : '알 수 없는 오류';
            await this.updateOutboxStatus(message._id.toString(), OutboxStatus.FAILED, errorMessage);
            this.logger.error(`개별 전송 실패: ${message.eventType}, ID: ${message._id}`, innerError);
            return false;
          }
        });

        await Promise.all(individualPromises);
        return false;
      }
    });

    // 모든 토픽의 처리 완료 대기
    await Promise.all(topicPromises);
  }

  /**
   * 3초마다 실행되는 스케줄러 - 처리 대기 상태의 메시지를 처리합니다.
   * 고부하 환경에서는 더 적은 주기(예: 5초)로 조정할 수 있습니다.
   */
  @Cron('*/3 * * * * *')
  async processPendingOutboxMessages(): Promise<void> {
    try {
      const startTime = Date.now();
      await this.processMessages(50); // 배치 처리 성능 향상에 따라 처리량 증가
      const processingTime = Date.now() - startTime;

      // 성능 모니터링 로깅 (고부하 분석용)
      if (processingTime > 5000) {
        // 5초 이상 걸리면 경고
        this.logger.warn(`메시지 처리에 ${processingTime}ms 소요됨 (처리 시간 과다)`);
      } else {
        this.logger.debug(`메시지 처리 완료: ${processingTime}ms 소요`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`메시지 처리 중 오류 발생: ${errorMessage}`, errorStack);
    }
  }

  /**
   * 1분마다 실행되는 스케줄러 - 실패한 메시지를 재시도합니다.
   * 실패 메시지는 점진적인 백오프로 처리하고 최대 재시도 횟수를 초과한 메시지는 DLQ 처리합니다.
   */
  @Cron('0 */1 * * * *')
  async retryFailedOutboxMessages(): Promise<void> {
    try {
      // 최대 재시도 횟수(10번)을 초과하지 않은 실패 메시지만 조회
      const failedMessages = await this.getFailedMessages(10);

      if (failedMessages.length === 0) {
        return;
      }

      this.logger.log(`재시도할 실패 메시지 ${failedMessages.length}개 발견`);

      // 실패한 메시지를 그룹화 (재시도 횟수에 따라)
      const messagesByRetryCount: Record<number, OutboxDocument[]> = {};

      failedMessages.forEach((message) => {
        const retryCount = message.retryCount || 0;
        if (!messagesByRetryCount[retryCount]) {
          messagesByRetryCount[retryCount] = [];
        }
        messagesByRetryCount[retryCount].push(message);
      });

      // 재시도 횟수에 따라 점진적으로 처리 (백오프 전략)
      for (const [retryCountStr, messages] of Object.entries(messagesByRetryCount)) {
        const retryCount = Number(retryCountStr);

        // 재시도 지연 시간 (지수 백오프)
        // 재시도 횟수가 증가할수록 지연 시간 증가 (1초, 2초, 4초, 8초...)
        const delayMs = Math.min(1000 * 2 ** retryCount, 60000); // 최대 1분

        this.logger.debug(`재시도 횟수 ${retryCount}회인 메시지 ${messages.length}개 처리 중... (지연: ${delayMs}ms)`);

        if (delayMs > 0 && retryCount > 0) {
          // 점진적 지연 처리
          await new Promise((resolve) => {
            setTimeout(resolve, delayMs);
          });
        }

        // 재시도를 위해 PENDING 상태로 변경
        const updatePromises = messages.map((message) =>
          this.updateOutboxStatus(message._id.toString(), OutboxStatus.PENDING),
        );

        await Promise.all(updatePromises);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`실패한 메시지 재시도 중 오류 발생: ${errorMessage}`, errorStack);
    }
  }
}
