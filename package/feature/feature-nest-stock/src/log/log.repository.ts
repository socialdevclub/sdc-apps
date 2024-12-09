import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { DeleteOptions } from 'mongodb';
import { FilterQuery, Model, MongooseQueryOptions, ProjectionType, QueryOptions } from 'mongoose';
import { StockLog, StockLogDocument } from './log.schema';

@Injectable()
export class LogRepository {
  constructor(
    @InjectModel(StockLog.name)
    private readonly stockLogModel: Model<StockLog>,
  ) {}

  find(
    filter: FilterQuery<StockLog>,
    projection: ProjectionType<StockLog>,
    options: QueryOptions<StockLog>,
  ): Promise<StockLogDocument[]> {
    return this.stockLogModel.find(filter, projection, options);
  }

  create(log: StockLog): Promise<StockLogDocument> {
    return this.stockLogModel.create(log);
  }

  async deleteMany(
    filter: FilterQuery<StockLog>,
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockLog>, 'lean' | 'timestamps'>,
  ): Promise<boolean> {
    return !!(await this.stockLogModel.deleteMany(filter, options));
  }
}
