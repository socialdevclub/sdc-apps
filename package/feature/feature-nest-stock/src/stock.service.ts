import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyInfo, Request, Response } from 'shared~type-stock';
import { Config, stock } from 'shared~config';
import { getDateDistance } from '@toss/date';
import { ceilToUnit } from '@toss/utils';
import mongoose, { ProjectionType, QueryOptions } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { INIT_STOCK_PRICE } from 'shared~config/dist/stock';
import { Stock, StockDocument } from './stock.schema';
import { UserService } from './user/user.service';
import { LogService } from './log/log.service';
import { StockLog } from './log/log.schema';
import { ResultService } from './result/result.service';
import { Result } from './result/result.schema';
import { StockRepository } from './stock.repository';
import { UserRepository } from './user/user.repository';

@Injectable()
export class StockService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly stockRepository: StockRepository,
    private readonly userRepository: UserRepository,
    private readonly userService: UserService,
    private readonly logService: LogService,
    private readonly resultService: ResultService,
  ) {}

  transStockToDto(stock: StockDocument): Response.GetStock {
    return {
      ...stock.toJSON({ versionKey: false }),
      startedTime: dayjs(stock.startedTime).utcOffset('9').format('YYYY-MM-DDTHH:mm:ssZ'),
    };
  }

  async find(options?: mongoose.QueryOptions<Stock>): Promise<Stock[]> {
    return this.stockRepository.find(undefined, undefined, options);
  }

  async findOneById(
    stockId: string,
    projection?: ProjectionType<Stock>,
    options?: QueryOptions<Stock>,
  ): Promise<StockDocument> {
    return this.stockRepository.findOneById(stockId, projection, options);
  }

  async findOneByIdAndUpdate(stock: Request.PatchUpdateStock, options?: QueryOptions<Stock>): Promise<Stock> {
    return this.stockRepository.findOneByIdAndUpdate(stock._id, stock, options);
  }

  async createStock(): Promise<Stock> {
    return this.stockRepository.create();
  }

  async resetStock(stockId: string): Promise<Stock> {
    let stock: Stock;

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      stock = await this.stockRepository.findOneAndUpdate(
        stockId,
        {
          $set: {
            companies: {},
            fluctuationsInterval: 5,
            isTransaction: false,
            isVisibleRank: false,
            remainingStocks: {},
            round: 0,
            startedTime: new Date(),
            stockPhase: 'CROWDING',
            transactionInterval: 2,
          },
        },
        { session },
      );
      await this.userService.initializeUsers(stockId, { session });
      await this.logService.deleteAllByStock(stockId, { session });
    });
    await session.endSession();

    return stock;
  }

  async initStock(stockId: string): Promise<Stock> {
    const stock = await this.stockRepository.findOneById(stockId);
    const players = await this.userService.getUserList(stockId);

    const companyPriceChange: string[][] = [[]];
    const newCompanies = {} as Record<stock.CompanyNames, CompanyInfo[]>;
    const playerIdxs = [...Array(players.length).keys()];

    const halfInfoCount = players.length > 30 ? Math.floor(90 / players.length) : 3;
    const randomPlayers = [...Array(halfInfoCount).keys()]
      .map(() => playerIdxs)
      .flat()
      .sort(() => Math.random() - 0.5);

    // 라운드 별 주가 변동 회사 선정
    for (let round = 1; round < 10; round++) {
      // 라운드당 (플레이어 수의 1/3) 만큼의 회사가 선정되며, 최대 10개로 제한됩니다 (전체 회사가 10개라서)
      const companyCount = Math.ceil(players.length / 3);
      const limitedCompanyCount = companyCount > 10 ? 10 : companyCount;
      companyPriceChange[round] = [...Config.Stock.getRandomCompanyNames(limitedCompanyCount)];
    }

    // 라운드별 주식의 가격을 설정하고, 플레이어에게 정보 제공
    Config.Stock.getRandomCompanyNames().forEach((key) => {
      const company = key as stock.CompanyNames;
      for (let round = 0; round < 10; round++) {
        if (!newCompanies[company]) {
          newCompanies[company] = [];
        }

        if (round === 0) {
          newCompanies[company][0] = {
            가격: INIT_STOCK_PRICE,
            정보: [],
          };
          continue;
        }

        const isChangePrice = companyPriceChange[round].some((v) => v === key);
        const prevPrice = newCompanies[company][round - 1].가격;

        const calc1 = Math.floor(Math.random() * prevPrice - prevPrice / 2);
        const calc2 = Math.floor(Math.random() * INIT_STOCK_PRICE - INIT_STOCK_PRICE / 2);

        const frunc = Math.abs(calc1) >= Math.abs(calc2) ? calc1 : prevPrice + calc2 <= 0 ? calc1 : calc2;
        const price = ceilToUnit(prevPrice + frunc, 100);
        const info = [];

        // 주가 변동 회사일 경우, 플레이어 2명에게 정보 제공
        if (isChangePrice) {
          const infoPlayerIdx = randomPlayers.pop();
          if (infoPlayerIdx !== undefined) {
            const partnerPlayerIdx = (infoPlayerIdx + stock.round + 1) % players.length;
            info.push(players[infoPlayerIdx].userId, players[partnerPlayerIdx].userId);
          }
        }

        newCompanies[company][round] = {
          가격: price,
          정보: info,
        };
      }
    });

    // 회사 별 주식 재고 설정
    const remainingStocks = {};
    Object.keys(newCompanies).forEach((company) => {
      remainingStocks[company] = players.length * 3;
    });

    const result = this.stockRepository.findOneAndUpdate(stockId, {
      $set: {
        companies: newCompanies,
        fluctuationsInterval: 5,
        isTransaction: false,
        isVisibleRank: false,
        remainingStocks,
        startedTime: new Date(),
        stockPhase: 'PLAYING',
        transactionInterval: 2,
      },
    });

    await this.logService.deleteAllByStock(stockId);
    return result;
  }

  async buyStock(stockId: string, body: Request.PostBuyStock): Promise<Stock> {
    const { userId, company, amount, unitPrice } = body;
    console.debug('buyStock', { amount, company, stockId, unitPrice, userId });
    let result: Stock;

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
      const user = await this.userRepository.findOne({ stockId, userId }, undefined, { session });
      const players = await this.userService.getUserList(stockId, { session });

      if (!stock.isTransaction) {
        throw new HttpException('지금은 거래할 수 없습니다', HttpStatus.CONFLICT);
      }

      if (!user) {
        throw new HttpException('유저 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
      }

      const { minutes, seconds } = getDateDistance(user.lastActivityTime, new Date());
      if (minutes === 0 && seconds < stock.transactionInterval) {
        throw new HttpException(`${stock.transactionInterval}초에 한 번만 거래할 수 있습니다`, HttpStatus.CONFLICT);
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

      if (companyCount + amount > players.length - 1) {
        throw new HttpException('주식 보유 한도 초과', HttpStatus.CONFLICT);
      }

      inventory.set(company, companyCount + amount);

      const remainingCompanyStock = remainingStocks.get(company);
      remainingStocks.set(company, remainingCompanyStock - amount);

      user.money -= totalPrice;
      user.lastActivityTime = new Date();

      await user.save({
        session,
      });
      result = await stock.save({
        session,
      });
      this.logService.addLog(
        new StockLog({
          action: 'BUY',
          company,
          date: user.lastActivityTime,
          price: companyPrice,
          quantity: amount,
          stockId,
          userId,
        }),
      );
    });
    await session.endSession();

    return result;
  }

  async sellStock(stockId: string, body: Request.PostSellStock): Promise<Stock> {
    const { userId, company, amount, unitPrice } = body;
    console.debug('🚀 ~ StockService ~ sellStock ~ body:', body);
    let result: Stock;

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
      const user = await this.userRepository.findOne({ stockId, userId }, undefined, { session });

      if (!user) {
        throw new HttpException('유저 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
      }

      if (!stock.isTransaction) {
        throw new HttpException('지금은 거래할 수 없습니다', HttpStatus.CONFLICT);
      }

      const { minutes, seconds } = getDateDistance(user.lastActivityTime, new Date());
      if (minutes === 0 && seconds < stock.transactionInterval) {
        throw new HttpException(`${stock.transactionInterval}초에 한 번만 거래할 수 있습니다`, HttpStatus.CONFLICT);
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
      result = await stock.save({ session });

      this.logService.addLog(
        new StockLog({
          action: 'SELL',
          company,
          date: user.lastActivityTime,
          price: companyPrice,
          quantity: amount,
          stockId,
          userId,
        }),
      );
    });
    await session.endSession();

    return result;
  }

  async allUserSellStock(stockId: string): Promise<Stock> {
    let result: Stock;

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
      const users = await this.userRepository.find({ stockId }, undefined, { session });

      if (!users) {
        throw new Error('users not found');
      }

      for await (const user of users) {
        const inventory = user.inventory as unknown as Map<string, number>;
        const companies = stock.companies as unknown as Map<string, CompanyInfo[]>;
        const remainingStocks = stock.remainingStocks as unknown as Map<string, number>;

        const idx = Math.min(
          Math.floor(getDateDistance(stock.startedTime, new Date()).minutes / stock.fluctuationsInterval),
          9,
        );
        inventory.forEach((amount, company) => {
          const companyPrice = companies.get(company)[idx]?.가격;
          const totalPrice = companyPrice * amount;

          user.money += totalPrice;
          remainingStocks.set(company, remainingStocks.get(company) + amount);
          inventory.set(company, 0);
        });

        await user.save({ session });
      }
      result = await stock.save({ session });
    });
    await session.endSession();

    return result;
  }

  async saveStockResult(stockId: string): Promise<Result[]> {
    let results: Result[];

    const session = await this.connection.startSession();
    await session.withTransaction(async () => {
      const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
      const users = await this.userRepository.find({ stockId }, undefined, { session });

      if (!users) {
        throw new Error('users not found');
      }

      for await (const user of users) {
        await this.resultService.setResult(
          {
            money: user.money,
            round: stock.round,
            stockId,
            userId: user.userId,
          },
          {
            session,
          },
        );
      }

      results = await this.resultService.getResults(undefined, { session });
      results = results.filter((v) => v.round === stock.round);
    });
    await session.endSession();

    return results;
  }
}
