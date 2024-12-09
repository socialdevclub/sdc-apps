import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';
import { Stock, StockDocument } from './stock.schema';

@Injectable()
export class StockRepository {
  constructor(
    @InjectModel(Stock.name)
    private readonly stockModel: Model<Stock>,
  ) {}

  find(
    filter?: FilterQuery<Stock>,
    projection?: ProjectionType<Stock>,
    options?: QueryOptions<Stock>,
  ): Promise<StockDocument[]> {
    return this.stockModel.find(filter, projection, options);
  }

  findOneByIdAndUpdate(
    stockId: string,
    update: UpdateQuery<Stock>,
    options?: QueryOptions<Stock>,
  ): Promise<StockDocument> {
    return this.stockModel.findOneAndUpdate({ _id: stockId }, update, { returnDocument: 'after', ...options });
  }

  findOneById(
    stockId: string,
    projection?: ProjectionType<Stock>,
    options?: QueryOptions<Stock>,
  ): Promise<StockDocument> {
    return this.stockModel.findOne(
      {
        _id: stockId,
      },
      projection,
      options,
    );
  }

  findOneAndUpdate(stockId: string, update: UpdateQuery<Stock>, options?: QueryOptions<Stock>): Promise<StockDocument> {
    return this.stockModel.findOneAndUpdate(
      {
        _id: stockId,
      },
      update,
      {
        returnDocument: 'after',
        ...options,
      },
    );
  }

  create(): Promise<StockDocument> {
    return this.stockModel.create(new Stock());
  }
}
