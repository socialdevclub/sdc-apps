import { Injectable } from '@nestjs/common';
import mongoose, { MongooseQueryOptions } from 'mongoose';
import { UpdateOptions } from 'mongodb';
import { Response } from 'shared~type-stock';
import dayjs from 'dayjs';
import { StockUser, UserDocument } from './user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  transStockUserToDto(stockUser: UserDocument): Response.GetStockUser {
    return {
      ...stockUser.toJSON({ versionKey: false }),
      lastActivityTime: dayjs(stockUser.lastActivityTime).utcOffset('9').format('YYYY-MM-DDTHH:mm:ssZ'),
    };
  }

  getUserList(stockId: string, options?: mongoose.QueryOptions<StockUser>): Promise<UserDocument[]> {
    return this.userRepository.find({ stockId }, undefined, options);
  }

  findOneByUserId(stockId: string, userId: string, options?: mongoose.QueryOptions<StockUser>): Promise<StockUser> {
    return this.userRepository.findOne({ stockId, userId }, null, options);
  }

  setUser(user: StockUser): Promise<StockUser> {
    return this.userRepository.findOneAndUpdate({ stockId: user.stockId, userId: user.userId }, user, { upsert: true });
  }

  removeUser(stockId: string, userId: string): Promise<boolean> {
    try {
      return this.userRepository.deleteOne({ stockId, userId });
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }

  async removeAllUser(stockId: string): Promise<boolean> {
    try {
      return this.userRepository.deleteMany({ stockId });
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }

  async initializeUsers(
    stockId: string,
    options?: UpdateOptions & Omit<MongooseQueryOptions<StockUser>, 'lean'>,
  ): Promise<boolean> {
    console.debug('initializeUsers');
    try {
      return this.userRepository.initializeUsers(stockId, options);
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }
}
