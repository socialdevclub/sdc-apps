import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, {
  FilterQuery,
  Model,
  MongooseQueryOptions,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import { DeleteOptions, UpdateOptions } from 'mongodb';
import { Response } from 'shared~type-stock';
import { StockUser, UserDocument } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(StockUser.name)
    private readonly userModel: Model<StockUser>,
  ) {}

  async create(user: StockUser): Promise<Response.GetCreateUser> {
    const session = await this.connection.startSession();

    try {
      return session.withTransaction(async () => {
        const doc = await this.findOne({ stockId: user.stockId, userId: user.userId }, null, {
          session,
        });
        if (!doc) {
          const newStockUser = new StockUser(user, user);
          const newDoc = new this.userModel(newStockUser);
          const updatedDoc = await newDoc.save({ session });
          return { isAlreadyExists: false, user: updatedDoc };
        }
        return { isAlreadyExists: true, user: doc };
      });
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      await session.endSession();
    }
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
