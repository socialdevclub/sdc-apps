import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { DeleteOptions, UpdateOptions } from 'mongodb';
import type {
  CreateOptions,
  FilterQuery,
  Model,
  MongooseQueryOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  UpdateWriteOpResult,
} from 'mongoose';
import type { StockLogDocument } from './log.schema';
import { StockLog } from './log.schema';

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

  findOne(
    filter: FilterQuery<StockLog>,
    projection: ProjectionType<StockLog>,
    options: QueryOptions<StockLog>,
  ): Promise<StockLogDocument> {
    return this.stockLogModel.findOne(filter, projection, options);
  }

  async create(log: StockLog, options?: CreateOptions): Promise<void> {
    await this.stockLogModel.create(log, options);
  }

  async updateOne(
    filter: FilterQuery<StockLog>,
    update: UpdateQuery<StockLog>,
    options?: UpdateOptions & Omit<MongooseQueryOptions<StockLog>, 'lean'>,
  ): Promise<UpdateWriteOpResult> {
    return this.stockLogModel.updateOne(filter, update, options);
  }

  async deleteMany(
    filter: FilterQuery<StockLog>,
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockLog>, 'lean' | 'timestamps'>,
  ): Promise<boolean> {
    return !!(await this.stockLogModel.deleteMany(filter, options));
  }
}
