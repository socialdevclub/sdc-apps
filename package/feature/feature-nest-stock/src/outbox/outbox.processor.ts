import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KafkaService } from '../kafka/kafka.service';
import { OutboxService } from './outbox.service';
import { OutboxStatus } from './outbox.schema';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  private readonly MAX_RETRIES = 3;

  // 마지막 처리 시간 추적을 위한 변수 추가
  private lastProcessingTime = Date.now();

  private readonly IDLE_CHECK_INTERVAL = 60000; // 60초 (1분)

  private isProcessingActive = true; // 처리 활성화 상태 플래그

  constructor(private readonly outboxService: OutboxService, private readonly kafkaService: KafkaService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutboxMessages(): Promise<void> {
    // 처리가 비활성화된 상태이면 먼저 확인
    if (!this.isProcessingActive) {
      // 비활성화 상태에서는 1분마다만 DB 확인
      const timeSinceLastCheck = Date.now() - this.lastProcessingTime;
      if (timeSinceLastCheck < this.IDLE_CHECK_INTERVAL) {
        return; // 아직 체크 시간이 되지 않았으면 바로 종료
      }
    }

    try {
      // 먼저 처리할 메시지가 있는지 빠르게 확인
      const hasPendingMessages = await this.outboxService.hasPendingMessages();

      if (!hasPendingMessages) {
        // 처리할 메시지가 없으면 비활성화 상태로 전환
        if (this.isProcessingActive) {
          this.logger.log('처리할 메시지가 없습니다. 프로세서를 대기 상태로 전환합니다.');
          this.isProcessingActive = false;
        }
        this.lastProcessingTime = Date.now();
        return;
      }

      // 처리할 메시지가 있으면 활성화 상태로 전환
      if (!this.isProcessingActive) {
        this.logger.log('처리할 메시지가 감지되었습니다. 프로세서를 활성화합니다.');
        this.isProcessingActive = true;
      }

      // 실제 메시지 처리 진행
      const pendingEvents = await this.outboxService.getPendingMessages(10);
      this.lastProcessingTime = Date.now();

      for (const event of pendingEvents) {
        try {
          this.logger.debug(`Processing outbox event: ${event._id}, type: ${event.eventType}`);

          await this.kafkaService.sendMessage(event.topic, JSON.parse(event.payload));
          await this.outboxService.updateOutboxStatus(event._id, OutboxStatus.PROCESSED);

          this.logger.debug(`Successfully processed outbox event: ${event._id}`);
        } catch (error: unknown) {
          const errorStack = error instanceof Error ? error.stack : undefined;
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

          this.logger.error(`Failed to process outbox event: ${event._id}`, errorStack);
          await this.outboxService.updateOutboxStatus(event._id, OutboxStatus.FAILED, errorMessage);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in outbox processing: ${errorMessage}`, errorStack);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async retryFailedMessages(): Promise<void> {
    // 처리가 비활성화된 상태이면 확인 없이 종료
    if (!this.isProcessingActive) {
      const timeSinceLastCheck = Date.now() - this.lastProcessingTime;
      if (timeSinceLastCheck < this.IDLE_CHECK_INTERVAL) {
        return; // 아직 체크 시간이 되지 않았으면 바로 종료
      }
    }

    try {
      // 먼저 재시도할 메시지가 있는지 빠르게 확인
      const hasFailedMessages = await this.outboxService.hasFailedMessages(this.MAX_RETRIES);

      if (!hasFailedMessages) {
        return; // 처리할 메시지가 없으면 바로 종료
      }

      // 재시도할 메시지가 있으면 활성화 상태로 전환
      if (!this.isProcessingActive) {
        this.logger.log('재시도할 실패 메시지가 감지되었습니다. 프로세서를 활성화합니다.');
        this.isProcessingActive = true;
      }

      const failedEvents = await this.outboxService.getFailedMessages(this.MAX_RETRIES);
      this.lastProcessingTime = Date.now();

      for (const event of failedEvents) {
        try {
          this.logger.debug(`Retrying failed outbox event: ${event._id}, attempt: ${event.retryCount + 1}`);

          await this.kafkaService.sendMessage(event.topic, JSON.parse(event.payload));
          await this.outboxService.updateOutboxStatus(event._id, OutboxStatus.PROCESSED);

          this.logger.debug(`Successfully processed failed outbox event: ${event._id}`);
        } catch (error: unknown) {
          const errorStack = error instanceof Error ? error.stack : undefined;
          const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

          this.logger.error(`Failed to retry outbox event: ${event._id}`, errorStack);
          await this.outboxService.updateOutboxStatus(event._id, OutboxStatus.FAILED, errorMessage);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error in failed outbox processing: ${errorMessage}`, errorStack);
    }
  }
}
