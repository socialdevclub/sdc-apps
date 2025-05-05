import { HttpException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { StockConfig } from 'shared~config';
import { StockStorageSchema } from 'shared~type-stock';
import { StockUser } from './user.schema';
import { Stock } from '../stock.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @InjectModel(Stock.name)
    private readonly stockModel: Model<Stock>,
  ) {}

  async addUserToStock(stockId: string, user: StockUser): Promise<void> {
    const session = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const stock = await this.stockModel.findById(stockId).session(session);
        if (!stock) {
          throw new HttpException('Stock not found', 404);
        }

        const existingUser = stock.users.find((u) => u.userId === user.userId);
        if (!existingUser) {
          const newStockUser = new StockUser(user, user);
          await this.stockModel.updateOne({ _id: stockId }, { $push: { users: newStockUser } }, { session });
        }
      });
    } catch (err) {
      console.error(err);
      throw new HttpException('POST /stock/user/register Unknown Error', 500, { cause: err });
    } finally {
      await session.endSession();
    }
  }

  async countUsers(stockId: string, filter: FilterQuery<StockUser> = {}): Promise<number> {
    const stock = await this.stockModel.findById(stockId);
    if (!stock) return 0;

    return stock.users.filter((user) => {
      for (const key in filter) {
        if (Object.prototype.hasOwnProperty.call(filter, key) && user[key] !== filter[key]) {
          return false;
        }
      }
      return true;
    }).length;
  }

  async findUsers(stockId: string): Promise<StockUser[]> {
    const stock = await this.stockModel.findById(stockId);
    if (!stock) return [];

    let { users } = stock.toJSON();

    // 정렬
    users = users.sort((a, b) => a.index - b.index);

    return users;
  }

  async findUser(stockId: string, userId: string): Promise<StockUser | null> {
    const stock = await this.stockModel.findById(stockId);
    if (!stock) throw new HttpException('Stock not found', 404);

    return stock.toJSON().users.find((user) => user.userId === userId);
  }

  async updateUser(stockId: string, userId: string, update: UpdateQuery<StockUser>): Promise<StockUser | null> {
    const session = await this.connection.startSession();
    let updatedUser = null;

    try {
      await session.withTransaction(async () => {
        const stock = await this.stockModel.findById(stockId).session(session);
        if (!stock) return;

        const userIndex = stock.users.findIndex((user) => user.userId === userId);
        if (userIndex === -1) return;

        // 업데이트 적용
        for (const key in update.$set) {
          if (Object.prototype.hasOwnProperty.call(update.$set, key)) {
            stock.users[userIndex][key] = update.$set[key];
          }
        }

        await stock.save({ session });
        updatedUser = stock.users[userIndex];
      });
    } catch (err) {
      console.error(err);
      throw new HttpException('Failed to update user', 500, { cause: err });
    } finally {
      await session.endSession();
    }

    return updatedUser;
  }

  async removeUser(stockId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.stockModel.updateOne({ _id: stockId }, { $pull: { users: { userId } } });
      return result.modifiedCount > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async removeAllUsers(stockId: string): Promise<boolean> {
    try {
      const result = await this.stockModel.updateOne({ _id: stockId }, { $set: { users: [] } });
      return result.modifiedCount > 0;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async initializeUsers(stockId: string): Promise<boolean> {
    try {
      const companies = StockConfig.getRandomCompanyNames();
      const stockStorages = companies.map((company) => {
        return {
          companyName: company,
          stockCountCurrent: 0,
          stockCountHistory: new Array(StockConfig.MAX_STOCK_IDX + 1).fill(0),
        } as StockStorageSchema;
      });

      const result = await this.stockModel.updateOne(
        { _id: stockId },
        {
          $set: {
            'users.$[].lastActivityTime': new Date(),
            'users.$[].money': StockConfig.INIT_USER_MONEY,
            'users.$[].stockStorages': stockStorages,
          },
        },
      );
      return result.modifiedCount > 0;
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }
}
