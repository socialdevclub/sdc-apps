import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { Result } from './result.schema';

@Injectable()
export class ResultService {
  constructor(
    @InjectModel(Result.name)
    private readonly resultModel: Model<Result>,
  ) {}

  async getResults(filter?: FilterQuery<Result>, options?: QueryOptions<Result>): Promise<Result[]> {
    return this.resultModel.find(filter, undefined, options);
  }

  async setResult(result: Result, options: QueryOptions<Result> = {}): Promise<Result> {
    return this.resultModel.findOneAndReplace(
      {
        round: result.round,
        stockId: result.stockId,
        userId: result.userId,
      },
      result,
      {
        upsert: true,
        ...options,
      },
    );
  }
}
