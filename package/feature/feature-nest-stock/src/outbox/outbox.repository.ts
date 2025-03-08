import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryOptions } from 'mongoose';
import { Outbox, OutboxDocument, OutboxEventType, OutboxStatus } from './outbox.schema';

@Injectable()
export class OutboxRepository {
  constructor(@InjectModel(Outbox.name) private readonly outboxModel: Model<OutboxDocument>) {}

  async create(
    eventType: OutboxEventType,
    payload: unknown,
    topic: string,
    options?: QueryOptions,
  ): Promise<OutboxDocument> {
    return this.outboxModel
      .create(
        [
          {
            eventType,
            payload: JSON.stringify(payload),
            retryCount: 0,
            status: OutboxStatus.PENDING,
            topic,
          },
        ],
        options,
      )
      .then((docs) => docs[0]);
  }

  async findPendingEvents(limit = 10): Promise<OutboxDocument[]> {
    return this.outboxModel.find({ status: OutboxStatus.PENDING }).sort({ createdAt: 1 }).limit(limit).exec();
  }

  /**
   * 대기 중인 메시지가 있는지 여부만 확인하는 최적화된 메서드
   * (전체 문서를 가져오는 대신 카운트만 확인하여 DB 부하 최소화)
   * @returns 대기 중인 메시지 존재 여부
   */
  async hasPendingEvents(): Promise<boolean> {
    // countDocuments 대신 exists 사용하여 더 빠른 확인 (MongoDB 최적화)
    const result = await this.outboxModel.exists({ status: OutboxStatus.PENDING });
    return result !== null;
  }

  async markAsProcessed(id: string): Promise<OutboxDocument> {
    return this.outboxModel.findByIdAndUpdate(
      id,
      {
        processedAt: new Date(),
        status: OutboxStatus.PROCESSED,
      },
      { new: true },
    );
  }

  async markAsFailed(id: string, errorMessage: string): Promise<OutboxDocument> {
    return this.outboxModel.findByIdAndUpdate(
      id,
      {
        $inc: { retryCount: 1 },
        errorMessage,
        status: OutboxStatus.FAILED,
      },
      { new: true },
    );
  }

  async findFailedEvents(maxRetries = 3): Promise<OutboxDocument[]> {
    return this.outboxModel
      .find({
        retryCount: { $lt: maxRetries },
        status: OutboxStatus.FAILED,
      })
      .sort({ updatedAt: 1 })
      .exec();
  }

  /**
   * 재시도 가능한 실패 메시지가 있는지 여부만 확인하는 최적화된 메서드
   * (전체 문서를 가져오는 대신 카운트만 확인하여 DB 부하 최소화)
   * @param maxRetries 최대 재시도 횟수
   * @returns 재시도 가능한 실패 메시지 존재 여부
   */
  async hasFailedEvents(maxRetries = 3): Promise<boolean> {
    // countDocuments 대신 exists 사용하여 더 빠른 확인 (MongoDB 최적화)
    const result = await this.outboxModel.exists({
      retryCount: { $lt: maxRetries },
      status: OutboxStatus.FAILED,
    });
    return result !== null;
  }
}
