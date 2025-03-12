import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import type { CompanyInfo, Request } from 'shared~type-stock';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { getDateDistance } from '@toss/date';
import { StockLog } from './log/log.schema';
import { UserRepository } from './user/user.repository';
import { UserService } from './user/user.service';
import { StockRepository } from './stock.repository';
import { LogService } from './log/log.service';

@Injectable()
export class StockProcessor {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly stockRepository: StockRepository,
    private readonly logService: LogService,
  ) {}

  async buyStock(stockId: string, body: Request.PostBuyStock, attributes?: { queueMessageId?: string }): Promise<void> {
    const { userId, company, amount, unitPrice } = body;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
        const players = await this.userService.getUserList(stockId, { session });

        const user = players.find((v) => v.userId === userId);

        if (stock.round !== body.round) {
          throw new HttpException('주식 라운드가 변경되었습니다. 다시 시도해주세요', HttpStatus.CONFLICT);
        }

        if (!stock.isTransaction) {
          throw new HttpException('지금은 거래할 수 없습니다', HttpStatus.CONFLICT);
        }

        if (!user) {
          throw new HttpException('유저 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
        }

        const isNotQueued = !attributes?.queueMessageId;

        if (isNotQueued) {
          const { minutes, seconds } = getDateDistance(user.lastActivityTime, new Date());
          if (minutes === 0 && seconds < stock.transactionInterval) {
            throw new HttpException(`${stock.transactionInterval}초에 한 번만 거래할 수 있습니다`, HttpStatus.CONFLICT);
          }
        }

        const companies = stock.companies as unknown as Map<string, CompanyInfo[]>;
        const remainingStocks = stock.remainingStocks as unknown as Map<string, number>;

        const companyInfo = companies.get(company);
        if (!companyInfo) {
          throw new HttpException('회사를 찾을 수 없습니다', HttpStatus.CONFLICT);
        }

        if (remainingStocks?.get(company) < amount) {
          throw new HttpException('시장에 주식이 없습니다', HttpStatus.CONFLICT);
        }

        // x분 단위로 가격이 변함
        const idx = Math.min(
          Math.floor(getDateDistance(stock.startedTime, new Date()).minutes / stock.fluctuationsInterval),
          9,
        );
        const companyPrice = companyInfo[idx].가격;
        const totalPrice = companyPrice * amount;
        if (user.money < totalPrice) {
          throw new HttpException('돈이 부족합니다', HttpStatus.CONFLICT);
        }
        if (companyPrice !== unitPrice) {
          throw new HttpException('주가가 변동되었습니다. 다시 시도해주세요', HttpStatus.CONFLICT);
        }

        const inventory = user.inventory as unknown as Map<string, number>;
        const companyCount = inventory.get(company) || 0;

        if (companyCount + amount > players.length * 2) {
          throw new HttpException('주식 보유 한도 초과', HttpStatus.CONFLICT);
        }

        inventory.set(company, companyCount + amount);

        const remainingCompanyStock = remainingStocks.get(company);
        remainingStocks.set(company, remainingCompanyStock - amount);

        user.money -= totalPrice;
        user.lastActivityTime = new Date();

        await user.save({ session });
        await stock.save({ session });

        if (isNotQueued) {
          await this.logService.addLog(
            new StockLog({
              action: 'BUY',
              company,
              date: user.lastActivityTime,
              price: companyPrice,
              quantity: amount,
              round: stock.round,
              status: 'SUCCESS',
              stockId,
              userId,
            }),
          );
          return;
        }

        const log = await this.logService.findOne({ queueId: attributes?.queueMessageId }, null, { session });
        switch (log?.status) {
          case 'CANCEL':
            throw new Error('취소된 요청입니다');
          case 'FAILED':
            throw new Error('실패된 요청입니다');
          case 'SUCCESS':
            throw new Error('이미 처리된 요청입니다');
          default:
        }

        await this.logService.updateOne(
          { queueId: attributes?.queueMessageId },
          { date: user.lastActivityTime, status: 'SUCCESS' },
          { session },
        );
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async sellStock(
    stockId: string,
    body: Request.PostSellStock,
    attributes?: { queueMessageId?: string },
  ): Promise<void> {
    const { userId, company, amount, unitPrice } = body;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
        const user = await this.userRepository.findOne({ stockId, userId }, undefined, { session });

        if (stock.round !== body.round) {
          throw new HttpException('주식 라운드가 변경되었습니다. 다시 시도해주세요', HttpStatus.CONFLICT);
        }

        if (!user) {
          throw new HttpException('유저 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
        }

        if (!stock.isTransaction) {
          throw new HttpException('지금은 거래할 수 없습니다', HttpStatus.CONFLICT);
        }

        const isNotQueued = !attributes?.queueMessageId;

        if (isNotQueued) {
          const { minutes, seconds } = getDateDistance(user.lastActivityTime, new Date());
          if (minutes === 0 && seconds < stock.transactionInterval) {
            throw new HttpException(`${stock.transactionInterval}초에 한 번만 거래할 수 있습니다`, HttpStatus.CONFLICT);
          }
        }

        const companies = stock.companies as unknown as Map<string, CompanyInfo[]>;
        const remainingStocks = stock.remainingStocks as unknown as Map<string, number>;
        const companyInfo = companies.get(company);
        const remainingCompanyStock = remainingStocks.get(company);

        if (!companyInfo) {
          throw new HttpException('회사 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
        }

        const inventory = user.inventory as unknown as Map<string, number>;
        if (!inventory.get(company) || inventory.get(company) < amount) {
          throw new HttpException('주식을 보유하고 있지 않습니다', HttpStatus.CONFLICT);
        }

        const idx = Math.min(
          Math.floor(getDateDistance(stock.startedTime, new Date()).minutes / stock.fluctuationsInterval),
          9,
        );
        const companyPrice = companyInfo[idx].가격;
        const totalPrice = companyPrice * amount;

        if (companyPrice !== unitPrice) {
          throw new HttpException('주가가 변동되었습니다. 다시 시도해주세요', HttpStatus.CONFLICT);
        }

        inventory.set(company, inventory.get(company) - amount);
        user.money += totalPrice;
        user.lastActivityTime = new Date();

        remainingStocks.set(company, remainingCompanyStock + amount);

        await user.save({ session });
        await stock.save({ session });

        if (isNotQueued) {
          await this.logService.addLog(
            new StockLog({
              action: 'SELL',
              company,
              date: user.lastActivityTime,
              price: companyPrice,
              quantity: amount,
              round: stock.round,
              status: 'SUCCESS',
              stockId,
              userId,
            }),
          );
          return;
        }

        const log = await this.logService.findOne({ queueId: attributes?.queueMessageId }, null, { session });
        switch (log?.status) {
          case 'CANCEL':
            throw new Error('취소된 요청입니다');
          case 'FAILED':
            throw new Error('실패된 요청입니다');
          case 'SUCCESS':
            throw new Error('이미 처리된 요청입니다');
          default:
        }

        await this.logService.updateOne(
          { queueId: attributes?.queueMessageId },
          { date: user.lastActivityTime, status: 'SUCCESS' },
          { session },
        );
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
