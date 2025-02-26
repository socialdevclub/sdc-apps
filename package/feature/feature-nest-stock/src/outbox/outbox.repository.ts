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
}
