import { Injectable } from '@nestjs/common';
import { MongooseQueryOptions, QueryOptions } from 'mongoose';
import { DeleteOptions } from 'mongodb';
import { StockLog, StockLogDocument } from './log.schema';
import { LogRepository } from './log.repository';

@Injectable()
export class LogService {
  constructor(private readonly stockLogRepository: LogRepository) {}

  async find(stockId: string, userId: string, options?: QueryOptions<StockLog>): Promise<StockLogDocument[]> {
    const logs = await this.stockLogRepository.find(
      {
        stockId,
        userId,
      },
      undefined,
      options,
    );
    return logs;
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
}
