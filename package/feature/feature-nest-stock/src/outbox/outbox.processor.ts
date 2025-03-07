import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { KafkaService } from '../kafka/kafka.service';
import { OutboxService } from './outbox.service';
import { OutboxStatus } from './outbox.schema';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);

  private readonly MAX_RETRIES = 3;

  constructor(private readonly outboxService: OutboxService, private readonly kafkaService: KafkaService) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutboxMessages(): Promise<void> {
    try {
      const pendingEvents = await this.outboxService.getPendingMessages(10);

      for (const event of pendingEvents) {
        try {
          this.logger.debug(`Processing outbox event: ${event._id}, type: ${event.eventType}`);

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
    try {
      const failedEvents = await this.outboxService.getFailedMessages(this.MAX_RETRIES);

      for (const event of failedEvents) {
        try {
          this.logger.debug(`Retrying failed outbox event: ${event._id}, attempt: ${event.retryCount + 1}`);

          await this.kafkaService.sendMessage(event.topic, event.payload);
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
