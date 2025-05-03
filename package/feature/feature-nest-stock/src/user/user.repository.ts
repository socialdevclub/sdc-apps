import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, {
  FilterQuery,
  Model,
  MongooseQueryOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { CountOptions, DeleteOptions, UpdateOptions } from 'mongodb';
import { StockConfig } from 'shared~config';
import { StockStorageSchema } from 'shared~type-stock';
import { StockUser, UserDocument } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(StockUser.name)
    private readonly userModel: Model<StockUser>,
  ) {}

  async create(user: StockUser): Promise<void> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const doc = await this.findOne({ stockId: user.stockId, userId: user.userId }, null, {
          session,
        });
        if (!doc) {
          const newStockUser = new StockUser(user, user);
          const newDoc = new this.userModel(newStockUser);
          await newDoc.save({ session });
        }
      });
    } catch (err) {
      console.error(err);
      throw new HttpException('POST /stock/user/register Unknown Error', 500, { cause: err });
    } finally {
      await session.endSession();
    }
  }

  async count(filter: FilterQuery<StockUser>): Promise<number> {
    return this.userModel.countDocuments(filter);
  }

  find(
    filter?: FilterQuery<StockUser>,
    projection?: ProjectionType<StockUser>,
    options?: QueryOptions<StockUser>,
  ): Promise<UserDocument[]> {
    return this.userModel.find(filter, projection, { sort: { index: 1 }, ...options });
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
    update: UpdateQuery<StockUser>,
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

  async updateOne(
    filter: FilterQuery<StockUser>,
    update: UpdateQuery<StockUser>,
    options?: UpdateOptions & Omit<MongooseQueryOptions<StockUser>, 'lean'>,
  ): Promise<boolean> {
    return !!(await this.userModel.updateOne(filter, update, options));
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
      const companies = StockConfig.getRandomCompanyNames();
      const stockStorages = companies.map((company) => {
        return {
          companyName: company,
          stockCountCurrent: 0,
          stockCountHistory: new Array(StockConfig.MAX_STOCK_IDX + 1).fill(0),
        } as StockStorageSchema;
      });
      return !!(await this.userModel.updateMany(
        { stockId },
        {
          $set: {
            lastActivityTime: new Date(),
            money: StockConfig.INIT_USER_MONEY,
            stockStorages,
          },
        },
        options,
      ));
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }

  async countDocuments(
    filter: FilterQuery<StockUser>,
    options?: CountOptions & Omit<MongooseQueryOptions<StockUser>, 'lean' | 'timestamps'>,
  ): Promise<number> {
    return this.userModel.countDocuments(filter, options);
  }
}
