import { Injectable } from '@nestjs/common';
import type {
  CreateOptions,
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
    company?: string,
    options?: QueryOptions<StockLog>,
  ): Promise<StockLogDocument[]> {
    const logs = await this.stockLogRepository.find(
      {
        company,
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

  async addLog(log: StockLog, options?: CreateOptions): Promise<void> {
    await this.stockLogRepository.create(log, options);
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

  /**
   * 1분 이상 지난 CANCEL, FAILED, QUEUING 상태의 로그를 삭제합니다.
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteOldStatusLogs(
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockLog>, 'lean' | 'timestamps'>,
  ): Promise<boolean> {
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    return this.stockLogRepository.deleteMany(
      {
        date: { $lt: oneMinuteAgo },
        status: { $in: ['CANCEL', 'FAILED', 'QUEUING'] },
      },
      options,
    );
  }
}
