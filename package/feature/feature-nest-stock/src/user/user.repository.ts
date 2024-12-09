import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, MongooseQueryOptions, ProjectionType, QueryOptions, UpdateQuery } from 'mongoose';
import { DeleteOptions, UpdateOptions } from 'mongodb';
import { StockUser, UserDocument } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(StockUser.name)
    private readonly userModel: Model<StockUser>,
  ) {}

  find(
    filter?: FilterQuery<StockUser>,
    projection?: ProjectionType<StockUser>,
    options?: QueryOptions<StockUser>,
  ): Promise<UserDocument[]> {
    return this.userModel.find(filter, projection, options);
  }

  findOne(
    filter: FilterQuery<StockUser>,
    projection?: ProjectionType<StockUser>,
    options?: QueryOptions<StockUser>,
  ): Promise<UserDocument> {
    return this.userModel.findOne(filter, projection, options);
  }

  findOneAndUpdate(
    filter: FilterQuery<StockUser>,
    update: StockUser,
    options?: QueryOptions<StockUser>,
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(filter, update, { returnDocument: 'after', ...options });
  }

  async deleteOne(
    filter: FilterQuery<StockUser>,
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockUser>, 'lean' | 'timestamps'>,
  ): Promise<boolean> {
    return !!(await this.userModel.deleteOne(filter, options));
  }

  async deleteMany(
    filter: FilterQuery<StockUser>,
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockUser>, 'lean' | 'timestamps'>,
  ): Promise<boolean> {
    return !!(await this.userModel.deleteMany(filter, options));
  }

  async updateMany(
    filter: FilterQuery<StockUser>,
    update: UpdateQuery<StockUser>,
    options?: UpdateOptions & Omit<MongooseQueryOptions<StockUser>, 'lean'>,
  ): Promise<boolean> {
    return !!(await this.userModel.updateMany(filter, update, options));
  }

  async initializeUsers(
    stockId: string,
    options?: UpdateOptions & Omit<MongooseQueryOptions<StockUser>, 'lean'>,
  ): Promise<boolean> {
    try {
      return !!(await this.userModel.updateMany(
        { stockId },
        {
          $set: {
            inventory: {},
            lastActivityTime: new Date(),
            money: 1000000,
          },
        },
        options,
      ));
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }
}
