import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import mongoose, { MongooseQueryOptions } from 'mongoose';
import { DeleteOptions, UpdateOptions } from 'mongodb';
import { CompanyInfo, Response } from 'shared~type-stock';
import dayjs from 'dayjs';
import { InjectConnection } from '@nestjs/mongoose';
import { getDateDistance } from '@toss/date';
import { StockConfig } from 'shared~config';
import { StockUser, UserDocument } from './user.schema';
import { UserRepository } from './user.repository';
import { StockRepository } from '../stock.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly userRepository: UserRepository,
    private readonly stockRepository: StockRepository,
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

  async alignIndex(stockId: string): Promise<void> {
    // 해당 주식방의 모든 사용자 목록을 가져옵니다
    const allUsers = await this.getUserList(stockId);

    // 성별로 사용자 분류
    const maleUsers = allUsers.filter((user) => user.userInfo.gender === 'M');
    const femaleUsers = allUsers.filter((user) => user.userInfo.gender === 'F');

    // 남녀 교차로 배치할 최종 순서 생성
    const alignedUsers = [];
    const maxLength = Math.max(femaleUsers.length, maleUsers.length);

    for (let i = 0; i < maxLength; i++) {
      // 남성 배치
      if (i < maleUsers.length) {
        alignedUsers.push(maleUsers[i]);
      }
      // 여성 배치
      if (i < femaleUsers.length) {
        alignedUsers.push(femaleUsers[i]);
      }
    }

    // 인덱스 업데이트
    for (let i = 0; i < alignedUsers.length; i++) {
      await this.userRepository.findOneAndUpdate({ stockId, userId: alignedUsers[i].userId }, { $set: { index: i } });
    }
  }

  async setIntroduce(stockId: string, userId: string, introduction: string): Promise<StockUser> {
    return this.userRepository.findOneAndUpdate(
      { stockId, userId },
      { $set: { 'userInfo.introduction': introduction } },
    );
  }

  removeUser(stockId: string, userId: string): Promise<boolean> {
    try {
      return this.userRepository.deleteOne({ stockId, userId });
    } catch (e: unknown) {
      throw new Error(e as string);
    }
  }

  async removeAllUser(
    stockId: string,
    options?: DeleteOptions & Omit<MongooseQueryOptions<StockUser>, 'lean' | 'timestamps'>,
  ): Promise<boolean> {
    try {
      return this.userRepository.deleteMany({ stockId }, options);
    } catch (e: unknown) {
      console.error(e);
      throw e;
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

  async startLoan(stockId: string, userId: string): Promise<Response.Common> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const user = await this.userRepository.findOne({ stockId, userId }, null, { session });
      if (!user) {
        throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      // 현재 매수 가능 금액이 100만원 미만인지 확인
      if (user.money >= StockConfig.BOUNDARY_LOAN_PRICE) {
        throw new HttpException('보유 금액이 100만원 이상인 경우 대출이 불가능합니다.', HttpStatus.BAD_REQUEST);
      }

      const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
      const companies = stock.companies as unknown as Map<string, CompanyInfo[]>;

      const idx = Math.min(
        Math.floor(getDateDistance(stock.startedTime, new Date()).minutes / stock.fluctuationsInterval),
        9,
      );

      const inventory = user.inventory as unknown as Map<string, number>;

      const allCompaniesPrice = Array.from(inventory.entries()).reduce((acc, [name, amount]) => {
        const companyInfo = companies.get(name);
        const price = companyInfo[idx]?.가격;
        return acc + price * amount;
      }, 0);

      const estimatedAllMoney = allCompaniesPrice + user.money;

      // 매수 가능 금액 + 보유 주식 가치가 100만원 미만인 경우 대출 이 불가능합니다.
      if (estimatedAllMoney >= StockConfig.BOUNDARY_LOAN_PRICE) {
        throw new HttpException(
          '[매수 가능 금액 + 보유 주식 가치]가 100만원 이상인 경우 대출이 불가능합니다.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 대출 실행
      await this.userRepository.updateMany(
        { stockId, userId },
        {
          $inc: {
            // 100만원 대출
            loanCount: 1,
            money: StockConfig.LOAN_PRICE, // 대출 횟수 증가
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
      session.endSession();
    }
  }

  async settleLoan(stockId: string, userId: string): Promise<Response.Common> {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();

      const user = await this.userRepository.findOne({ stockId, userId }, null, { session });
      if (!user) {
        throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      // 대출금 회수: 대출 횟수 * 200만원
      const loanAmount = user.loanCount * 2_000_000;
      const finalMoney = user.money - loanAmount;

      // 대출금 회수 및 대출 횟수 초기화
      await this.userRepository.updateMany(
        { stockId, userId },
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
      session.endSession();
    }
  }
}
