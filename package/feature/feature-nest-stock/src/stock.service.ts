import { HttpException, HttpStatus, Injectable, Inject, forwardRef } from '@nestjs/common';
import type { CompanyInfo, Request, Response, StockPhase } from 'shared~type-stock';
import { getDateDistance } from '@toss/date';
import { ceilToUnit } from '@toss/utils';
import type { ProjectionType, QueryOptions } from 'mongoose';
import mongoose from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import dayjs from 'dayjs';
import { StockConfig } from 'shared~config';
import type { Stock, StockDocument } from './stock.schema';
import { UserService } from './user/user.service';
import { LogService } from './log/log.service';
import { ResultService } from './result/result.service';
import type { Result } from './result/result.schema';
import { StockRepository } from './stock.repository';
import { UserRepository } from './user/user.repository';

@Injectable()
export class StockService {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly stockRepository: StockRepository,
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => UserService))
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
    try {
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
              transactionInterval: 0,
            },
          },
          { session },
        );
        await this.userService.initializeUsers(stockId, { session });
        await this.logService.deleteAllByStock(stockId, { session });
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }

    return stock;
  }

  async initStock(stockId: string): Promise<Stock> {
    const players = await this.userService.getUserList(stockId);

    const companyPriceChange: string[][] = [[]];
    const newCompanies = {} as Record<StockConfig.CompanyNames, CompanyInfo[]>;
    const playerIdxs = Array.from({ length: players.length }, (_, idx) => idx);

    // 플레이어에게 줄 정보의 절반 개수
    // 플레이어 수 00명 ~ 30명 : 3개 (*2 = 6개)
    // 플레이어 수 31명 ~ 45명 : 2개 (*2 = 4개)
    // 플레이어 수 46명 ~     : 1개 (*2 = 2개)
    const halfInfoCount = Math.min(Math.max(Math.floor(90 / players.length), 1), 3);

    // 플레이어에게 줄 정보를 랜덤하게 주기 위한 배열
    const randomPlayers = Array.from({ length: halfInfoCount }, (_, idx) => idx)
      .map(() => playerIdxs)
      .flat()
      .sort(() => Math.random() - 0.5);

    // 라운드 별 주가 변동 회사 선정
    for (let round = 1; round < 10; round++) {
      // 라운드당 (플레이어 수의 1/3) 만큼의 회사가 선정되며, 최대 10개로 제한됩니다 (전체 회사가 10개라서)
      const companyCount = Math.ceil(players.length / 3);
      const limitedCompanyCount = companyCount > 10 ? 10 : companyCount;
      companyPriceChange[round] = [...StockConfig.getRandomCompanyNames(limitedCompanyCount)];
    }

    // 라운드별 주식의 가격을 설정하고, 플레이어에게 정보 제공
    StockConfig.getRandomCompanyNames().forEach((key) => {
      const company = key as StockConfig.CompanyNames;
      for (let round = 0; round < 10; round++) {
        if (!newCompanies[company]) {
          newCompanies[company] = [];
        }

        if (round === 0) {
          newCompanies[company][0] = {
            가격: StockConfig.INIT_STOCK_PRICE,
            정보: [],
          };
          continue;
        }

        const isChangePrice = companyPriceChange[round].some((v) => v === key);
        const prevPrice = newCompanies[company][round - 1].가격;

        const calc1 = Math.floor(Math.random() * prevPrice - prevPrice / 2);
        const calc2 = Math.floor(Math.random() * StockConfig.INIT_STOCK_PRICE - StockConfig.INIT_STOCK_PRICE / 2);

        const frunc = Math.abs(calc1) >= Math.abs(calc2) ? calc1 : prevPrice + calc2 <= 0 ? calc1 : calc2;
        const price = ceilToUnit(prevPrice + frunc, 100);
        const info = [];

        // 주가 변동 회사일 경우, 플레이어 2명에게 정보 제공
        if (isChangePrice) {
          const infoPlayerIdx = randomPlayers.pop();
          if (infoPlayerIdx !== undefined) {
            const partnerPlayerIdx = (infoPlayerIdx + 1) % players.length;
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
        transactionInterval: 0,
      },
    });

    await this.logService.deleteAllByStock(stockId);
    return result;
  }

  async drawStockInfo(stockId: string, body: Request.PostDrawStockInfo): Promise<Stock> {
    const { userId } = body;
    let result: Stock;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
        const user = await this.userRepository.findOne({ stockId, userId }, undefined, { session });

        if (!stock.isTransaction) {
          throw new HttpException('지금은 거래할 수 없습니다', HttpStatus.CONFLICT);
        }

        if (!user) {
          throw new HttpException('유저 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
        }

        // 현재 라운드에 해당하는 시점의 idx
        const timeIdx = Math.min(
          Math.floor(getDateDistance(stock.startedTime, new Date()).minutes / stock.fluctuationsInterval),
          9,
        );

        const nextTimeIdx = timeIdx + StockConfig.ROUND_SKIP_STEP;

        if (user.money < StockConfig.DEFAULT_DRAW_COST) {
          throw new HttpException('잔액이 부족합니다', HttpStatus.CONFLICT);
        }

        const companies = stock.companies as unknown as Map<string, Array<{ 가격: number; 정보: string[] }>>;
        // 이미 정보를 가지고 있지 않은 회사들 중에서만 선택
        const availableCompanies = Array.from(companies.entries())
          .filter(([_, companyInfos]) => {
            // nextTimeIdx 이후의 모든 시점에서 정보를 가지고 있지 않은 회사만 선택
            return companyInfos.slice(nextTimeIdx).some((info) => !info.정보.includes(userId));
          })
          .map(([company]) => company);

        if (availableCompanies.length === 0) {
          throw new HttpException('더 이상 뽑을 수 있는 정보가 없습니다', HttpStatus.CONFLICT);
        }

        // 랜덤으로 회사 선택
        const randomIndex = Math.floor(Math.random() * availableCompanies.length);
        const selectedCompany = availableCompanies[randomIndex];

        // 랜덤으로 시점 선택 (정보를 가지고 있는 시점만 선택)
        let randomTimeIndex =
          Math.floor(Math.random() * (companies.get(selectedCompany).length - nextTimeIdx)) + nextTimeIdx;

        // 선택된 회사의 정보 업데이트
        const companyInfos = [...companies.get(selectedCompany)]; // 배열 복사

        // 해당 배열안에 이미 user Id가 있는지 확인
        let isExistUser = companyInfos[randomTimeIndex].정보.find((v) => v === userId);
        // user Id가 있는 때는 randomTimeIndex를 다시 생성
        while (isExistUser) {
          randomTimeIndex =
            Math.floor(Math.random() * (companies.get(selectedCompany).length - nextTimeIdx)) + nextTimeIdx;
          isExistUser = companyInfos[randomTimeIndex].정보.find((v) => v === userId);
        }

        companyInfos[randomTimeIndex] = {
          ...companyInfos[randomTimeIndex],
          정보: [...companyInfos[randomTimeIndex].정보, userId],
        };

        // stock 객체 직접 업데이트 (Record 형식으로 변환)
        // ! companies의 set 메소드가 동작을 안함
        const updatedCompanies = Object.fromEntries(companies.entries());
        updatedCompanies[selectedCompany] = companyInfos;
        stock.companies = updatedCompanies;

        user.money -= StockConfig.DEFAULT_DRAW_COST;
        user.lastActivityTime = new Date();

        await user.save({
          session,
        });

        result = await stock.save({
          session,
        });

        // TODO: 로그를 심고 싶으면 좀 더 범용적으로 설계를 해야할 것만 같은 기분이 듬
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }

    return result;
  }

  async allUserSellStock(stockId: string): Promise<Stock> {
    let result: Stock;

    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        const stock = await this.stockRepository.findOneById(stockId, undefined, { session });
        const users = await this.userRepository.find({ stockId }, undefined, { session });

        if (!users) {
          throw new Error('users not found');
        }

        for await (const user of users) {
          const companies = stock.companies as unknown as Map<string, CompanyInfo[]>;
          const remainingStocks = stock.remainingStocks as unknown as Map<string, number>;

          const idx = Math.min(
            Math.floor(getDateDistance(stock.startedTime, new Date()).minutes / stock.fluctuationsInterval),
            9,
          );

          user.stockStorages.forEach((stockStorage) => {
            const companyPrice = companies.get(stockStorage.companyName)[idx]?.가격;
            const totalPrice = companyPrice * stockStorage.stockCountCurrent;

            user.money += totalPrice;
            remainingStocks.set(
              stockStorage.companyName,
              remainingStocks.get(stockStorage.companyName) + stockStorage.stockCountCurrent,
            );
            stockStorage.stockCountHistory[idx] -= stockStorage.stockCountCurrent;
            stockStorage.stockCountCurrent = 0;
          });

          const loanMoney = user.loanCount * StockConfig.SETTLE_LOAN_PRICE;
          user.money -= loanMoney;
          user.loanCount = 0;

          await user.save({ session });
        }
        result = await stock.save({ session });
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }

    return result;
  }

  async saveStockResult(stockId: string): Promise<Result[]> {
    let results: Result[];

    const session = await this.connection.startSession();
    try {
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
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }

    return results;
  }

  async deleteStock(stockId: string): Promise<boolean> {
    const session = await this.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await this.resultService.deleteResult({ stockId }, { session });
        await this.logService.deleteAllByStock(stockId, { session });
        await this.userService.removeAllUser(stockId, { session });
        await this.stockRepository.deleteMany({ _id: stockId }, { session });
      });
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await session.endSession();
    }

    return true;
  }

  async setStockPhase(stockId: string, phase: StockPhase): Promise<Stock> {
    if (phase === 'INTRO_RESULT') {
      await this.userService.alignIndexByOpenAI(stockId);
    }
    return this.stockRepository.findOneAndUpdate(stockId, { $set: { stockPhase: phase } });
  }
}
