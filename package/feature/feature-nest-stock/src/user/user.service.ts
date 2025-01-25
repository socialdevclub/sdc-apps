import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import mongoose, { MongooseQueryOptions } from 'mongoose';
import { UpdateOptions } from 'mongodb';
import { Response } from 'shared~type-stock';
import dayjs from 'dayjs';
import { InjectConnection } from '@nestjs/mongoose';
import { StockUser, UserDocument } from './user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly userRepository: UserRepository,
  ) {}

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

  async startLoan(userId: string): Promise<Response.Common> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const user = await this.userRepository.findOne({ userId });
      if (!user) {
        throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      // 현재 자산이 100만원 미만인지 확인
      if (user.money >= 1_000_000) {
        throw new HttpException('보유 금액이 100만원 이상인 경우 대출이 불가능합니다.', HttpStatus.BAD_REQUEST);
      }

      // 대출 실행
      await this.userRepository.updateMany(
        { userId },
        {
          $inc: {
            // 200만원 대출
            loanCount: 1,
            money: 1_000_000, // 대출 횟수 증가
          },
        },
        { session },
      );

      await session.commitTransaction();
      return { message: '대출이 성공적으로 실행되었습니다.', status: 201 };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async settleLoan(userId: string): Promise<Response.Common> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const user = await this.userRepository.findOne({ userId });
      if (!user) {
        throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      // 대출금 회수: 대출 횟수 * 200만원
      const loanAmount = user.loanCount * 2_000_000;
      const finalMoney = user.money - loanAmount;

      // 대출금 회수 및 대출 횟수 초기화
      await this.userRepository.updateMany(
        { userId },
        {
          $set: {
            loanCount: 0,
            money: finalMoney,
          },
        },
        { session },
      );

      await session.commitTransaction();
      return {
        data: { finalMoney },
        message: `대출금 ${loanAmount.toLocaleString()}원이 회수되었습니다.`,
        status: 200,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
