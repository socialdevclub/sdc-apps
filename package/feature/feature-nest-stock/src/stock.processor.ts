import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import type { Request, Response } from 'shared~type-stock';
import { getDateDistance } from '@toss/date';
import { isStockOverLimit } from 'shared~config/dist/stock';
import dayjs from 'dayjs';
import { UserRepository } from './user/user.repository';
import { StockRepository } from './stock.repository';
import { LogService } from './log/log.service';

@Injectable()
export class StockProcessor {
  constructor(
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
    private readonly stockRepository: StockRepository,
    private readonly logService: LogService,
  ) {}

  async buyStock(
    stockId: string,
    body: Request.PostBuyStock,
    attributes?: { queueMessageId?: string },
  ): Promise<Response.Common> {
    const { userId, company, amount, unitPrice } = body;

    try {
      // 필요한 데이터 조회
      const stock = await this.stockRepository.findOneById(stockId);
      const user = await this.userRepository.findOne({ stockId, userId });
      const playerCount = await this.userRepository.countDocuments({ stockId });

      if (!stock) {
        throw new Error('스톡 정보를 불러올 수 없습니다');
      }

      if (stock.round !== body.round) {
        throw new Error('주식 라운드가 변경되었습니다. 다시 시도해주세요');
      }

      if (!stock.isTransaction) {
        throw new Error('지금은 거래할 수 없습니다');
      }

      if (!user) {
        throw new Error('유저 정보를 불러올 수 없습니다');
      }

      const { companies } = stock;
      const remainingStocks = stock.remainingStocks as unknown as Record<string, number>;

      const companyInfo = companies[company];
      if (!companyInfo) {
        throw new Error('회사를 찾을 수 없습니다');
      }

      if (remainingStocks[company] < amount) {
        throw new Error('시장에 주식이 없습니다');
      }

      const idx = Math.min(
        Math.floor(getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).minutes / stock.fluctuationsInterval),
        9,
      );
      const companyPrice = companyInfo[idx].가격;
      const totalPrice = companyPrice * amount;
      if (user.money < totalPrice) {
        throw new Error('돈이 부족합니다');
      }
      if (companyPrice !== unitPrice) {
        throw new Error('주가가 변동되었습니다. 다시 시도해주세요');
      }

      const stockStorage = user.stockStorages.find((v) => v.companyName === company);
      if (!stockStorage) {
        throw new Error(`주식 보유 정보 ${company}를 불러올 수 없습니다`);
      }

      const companyCount = stockStorage.stockCountCurrent;

      if (isStockOverLimit(playerCount, companyCount, amount)) {
        throw new Error('주식 보유 한도 초과');
      }

      // 필요한 로그 확인
      // const log = await this.logService.findOne({ queueId: attributes?.queueMessageId });

      // switch (log?.status) {
      //   case 'CANCEL':
      //     throw new Error('취소된 요청입니다');
      //   case 'FAILED':
      //     throw new Error('실패된 요청입니다');
      //   case 'SUCCESS':
      //     throw new Error('이미 처리된 요청입니다');
      //   default:
      // }

      // 주식 및 보유량 업데이트
      const updatedStockStorage = {
        ...stockStorage,
        stockCountCurrent: companyCount + amount,
        stockCountHistory: [...stockStorage.stockCountHistory],
      };
      updatedStockStorage.stockCountHistory[idx] += amount;
      // 사용자 정보 업데이트
      const updatedStockStorages = user.stockStorages.map((storage) =>
        storage.companyName === company ? updatedStockStorage : storage,
      );

      await this.userRepository.updateOne(
        { stockId, userId },
        {
          lastActivityTime: dayjs().toISOString(),
          money: user.money - totalPrice,
          stockStorages: updatedStockStorages,
        },
      );

      // 남은 주식 업데이트
      const updatedRemainingStocks = { ...remainingStocks };
      updatedRemainingStocks[company] = remainingStocks[company] - amount;

      await this.stockRepository.updateOne(
        { _id: stockId },
        {
          remainingStocks: updatedRemainingStocks,
        },
      );

      // 로그 상태 업데이트
      await this.logService.updateOne({ queueId: attributes?.queueMessageId }, { date: new Date(), status: 'SUCCESS' });

      return {
        message: `주식을 ${amount}주 구매하였습니다.`,
        status: 200,
      };
    } catch (error) {
      console.error(error);
      await this.logService.updateOne(
        { queueId: attributes?.queueMessageId },
        { failedReason: error instanceof Error ? error.message : `${error}`, status: 'FAILED' },
      );

      return {
        message: `${error instanceof Error ? error.message : `${error}`}`,
        status: 400,
      };
    } finally {
      this.logService.deleteOldStatusLogs().catch(console.error);
    }
  }

  async sellStock(
    stockId: string,
    body: Request.PostSellStock,
    attributes?: { queueMessageId?: string },
  ): Promise<Response.Common> {
    const { userId, company, amount, unitPrice } = body;

    try {
      // 필요한 데이터 조회
      const stock = await this.stockRepository.findOneById(stockId);
      const user = await this.userRepository.findOne({ stockId, userId });

      if (!stock) {
        throw new Error('스톡 정보를 불러올 수 없습니다');
      }

      if (stock.round !== body.round) {
        throw new Error('주식 라운드가 변경되었습니다. 다시 시도해주세요');
      }

      if (!user) {
        throw new Error('유저 정보를 불러올 수 없습니다');
      }

      if (!stock.isTransaction) {
        throw new Error('지금은 거래할 수 없습니다');
      }

      const { companies, remainingStocks } = stock;
      const companyInfo = companies[company];
      const remainingCompanyStock = remainingStocks[company];

      if (!companyInfo) {
        throw new HttpException('회사 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
      }

      const stockStorage = user.stockStorages.find((v) => v.companyName === company);
      if (!stockStorage) {
        throw new Error(`주식 보유 정보 ${company}를 불러올 수 없습니다`);
      }

      const companyCount = stockStorage.stockCountCurrent;
      if (companyCount < amount) {
        throw new HttpException('주식을 보유하고 있지 않습니다', HttpStatus.CONFLICT);
      }

      const idx = Math.min(
        Math.floor(getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).minutes / stock.fluctuationsInterval),
        9,
      );
      const companyPrice = companyInfo[idx].가격;
      const totalPrice = companyPrice * amount;

      if (companyPrice !== unitPrice) {
        throw new HttpException('주가가 변동되었습니다. 다시 시도해주세요', HttpStatus.CONFLICT);
      }

      // 필요한 로그 확인
      // const log = await this.logService.findOne({ queueId: attributes?.queueMessageId });

      // switch (log?.status) {
      //   case 'CANCEL':
      //     throw new Error('취소된 요청입니다');
      //   case 'FAILED':
      //     throw new Error('실패된 요청입니다');
      //   case 'SUCCESS':
      //     throw new Error('이미 처리된 요청입니다');
      //   default:
      // }

      // 주식 및 보유량 업데이트
      const updatedStockStorage = {
        ...stockStorage,
        stockCountCurrent: companyCount - amount,
        stockCountHistory: [...stockStorage.stockCountHistory],
      };
      updatedStockStorage.stockCountHistory[idx] -= amount;

      // 사용자 정보 업데이트
      const updatedStockStorages = user.stockStorages.map((storage) =>
        storage.companyName === company ? updatedStockStorage : storage,
      );

      await this.userRepository.updateOne(
        { stockId, userId },
        {
          lastActivityTime: dayjs().toISOString(),
          money: user.money + totalPrice,
          stockStorages: updatedStockStorages,
        },
      );

      // 남은 주식 업데이트
      const updatedRemainingStocks = { ...remainingStocks };
      updatedRemainingStocks[company] = remainingCompanyStock + amount;

      await this.stockRepository.updateOne(
        { _id: stockId },
        {
          remainingStocks: updatedRemainingStocks,
        },
      );

      // 로그 상태 업데이트
      await this.logService.updateOne({ queueId: attributes?.queueMessageId }, { date: new Date(), status: 'SUCCESS' });

      return {
        message: `주식을 ${amount}주 판매하였습니다.`,
        status: 200,
      };
    } catch (error) {
      console.error(error);
      await this.logService.updateOne(
        { queueId: attributes?.queueMessageId },
        { failedReason: error instanceof Error ? error.message : `${error}`, status: 'FAILED' },
      );
      return {
        message: `${error instanceof Error ? error.message : `${error}`}`,
        status: 400,
      };
    } finally {
      this.logService.deleteOldStatusLogs().catch(console.error);
    }
  }
}
