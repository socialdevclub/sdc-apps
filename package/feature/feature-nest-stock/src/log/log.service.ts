import { Injectable } from '@nestjs/common';
import type {
  FilterQuery,
  MongooseQueryOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import type { DeleteOptions, UpdateOptions } from 'mongodb';
import type { StockLog, StockLogDocument } from './log.schema';
import { LogRepository } from './log.repository';

@Injectable()
export class LogService {
  constructor(private readonly stockLogRepository: LogRepository) {}

  async find(
    stockId: string,
    userId: string,
    round: number,
    options?: QueryOptions<StockLog>,
  ): Promise<StockLogDocument[]> {
    const logs = await this.stockLogRepository.find(
      {
        round,
        stockId,
        userId,
      },
      undefined,
      options,
    );
    return logs;
  }

  async findOne(
    filter: FilterQuery<StockLog>,
    projection?: ProjectionType<StockLog>,
    options?: QueryOptions<StockLog>,
  ): Promise<StockLogDocument> {
    return this.stockLogRepository.findOne(filter, projection, options);
  }

  async addLog(log: StockLog): Promise<StockLogDocument> {
    return this.stockLogRepository.create(log);
  }

  async deleteAllByStock(
    stockId: string,
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockLog>, 'lean' | 'timestamps'>,
  ): Promise<void> {
    await this.stockLogRepository.deleteMany({ stockId }, options);
  }

  async updateOne(
    filter: FilterQuery<StockLog>,
    update: UpdateQuery<StockLog>,
    options?: UpdateOptions & Omit<MongooseQueryOptions<StockLog>, 'lean'>,
  ): Promise<UpdateWriteOpResult> {
    return this.stockLogRepository.updateOne(filter, update, options);
  }
}
