import { HttpException, HttpStatus, Injectable, Inject, forwardRef } from '@nestjs/common';
import type { CompanyInfo, Request, Response, StockPhase, StockSchemaWithId } from 'shared~type-stock';
import { getDateDistance } from '@toss/date';
import { ceilToUnit } from '@toss/utils';
import dayjs from 'dayjs';
import { StockConfig } from 'shared~config';
import { UserService } from './user/user.service';
import { LogService } from './log/log.service';
import { ResultService } from './result/result.service';
import type { Result } from './result/result.schema';
import { StockRepository } from './stock.repository';
import { UserRepository } from './user/user.repository';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    @Inject(forwardRef(() => UserRepository))
    private readonly userRepository: UserRepository,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly logService: LogService,
    private readonly resultService: ResultService,
  ) {}

  transStockToDto(stock: StockSchemaWithId): Response.GetStock {
    return {
      ...stock,
      startedTime: dayjs(stock.startedTime).utcOffset('9').format('YYYY-MM-DDTHH:mm:ssZ'),
    };
  }

  async find(): Promise<StockSchemaWithId[]> {
    return this.stockRepository.find();
  }

  async findOneById(stockId: string): Promise<StockSchemaWithId | null> {
    return this.stockRepository.findOneById(stockId);
  }

  async findOneByIdAndUpdate(stock: Request.PatchUpdateStock): Promise<StockSchemaWithId | null> {
    return this.stockRepository.findOneAndUpdate(stock._id, stock);
  }

  async createStock(): Promise<StockSchemaWithId> {
    return this.stockRepository.create();
  }

  async resetStock(stockId: string): Promise<StockSchemaWithId | null> {
    try {
      // 스톡 업데이트
      const stock = await this.stockRepository.findOneAndUpdate(stockId, {
        companies: {},
        fluctuationsInterval: 5,
        isTransaction: false,
        isVisibleRank: false,
        remainingStocks: {},
        round: 0,
        startedTime: dayjs().toISOString(),
        stockPhase: 'CROWDING',
        transactionInterval: 0,
      });

      // 사용자 초기화
      await this.userService.initializeUsers(stockId);

      // 로그 삭제
      await this.logService.deleteAllByStock(stockId);

      return stock;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async initStock(stockId: string): Promise<StockSchemaWithId | null> {
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

    // DynamoDB 업데이트
    await this.logService.deleteAllByStock(stockId);

    return this.stockRepository.findOneAndUpdate(stockId, {
      companies: newCompanies,
      fluctuationsInterval: 5,
      isTransaction: false,
      isVisibleRank: false,
      remainingStocks,
      startedTime: dayjs().toISOString(),
      stockPhase: 'PLAYING',
      transactionInterval: 0,
    });
  }

  async drawStockInfo(stockId: string, body: Request.PostDrawStockInfo): Promise<StockSchemaWithId | null> {
    try {
      const { userId } = body;

      const stock = await this.stockRepository.findOneById(stockId);
      const user = await this.userRepository.findOne({ stockId, userId });

      if (!stock) {
        throw new HttpException('스톡을 찾을 수 없습니다', HttpStatus.NOT_FOUND);
      }

      if (!stock.isTransaction) {
        throw new HttpException('지금은 거래할 수 없습니다', HttpStatus.CONFLICT);
      }

      if (!user) {
        throw new HttpException('유저 정보를 불러올 수 없습니다', HttpStatus.CONFLICT);
      }

      // 현재 라운드에 해당하는 시점의 idx
      const timeIdx = Math.min(
        Math.floor(getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).minutes / stock.fluctuationsInterval),
        9,
      );

      const nextTimeIdx = timeIdx + StockConfig.ROUND_SKIP_STEP;

      if (user.money < StockConfig.DEFAULT_DRAW_COST) {
        throw new HttpException('잔액이 부족합니다', HttpStatus.CONFLICT);
      }

      const { companies } = stock;

      // 이미 정보를 가지고 있지 않은 회사들 중에서만 선택
      const availableCompanies = Object.entries(companies)
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
      let randomTimeIndex = Math.floor(Math.random() * (companies[selectedCompany].length - nextTimeIdx)) + nextTimeIdx;

      // 선택된 회사의 정보 업데이트
      const companyInfos = [...companies[selectedCompany]]; // 배열 복사

      // 해당 배열안에 이미 user Id가 있는지 확인
      let isExistUser = companyInfos[randomTimeIndex].정보.find((v) => v === userId);
      // user Id가 있는 때는 randomTimeIndex를 다시 생성
      while (isExistUser) {
        randomTimeIndex = Math.floor(Math.random() * (companies[selectedCompany].length - nextTimeIdx)) + nextTimeIdx;
        isExistUser = companyInfos[randomTimeIndex].정보.find((v) => v === userId);
      }

      companyInfos[randomTimeIndex] = {
        ...companyInfos[randomTimeIndex],
        정보: [...companyInfos[randomTimeIndex].정보, userId],
      };

      // 업데이트된 회사 정보로 객체 생성
      const updatedCompanies = { ...companies };
      updatedCompanies[selectedCompany] = companyInfos;

      // 스톡 정보 업데이트
      await this.stockRepository.findOneAndUpdate(stockId, {
        companies: updatedCompanies,
      });

      // 사용자 정보 업데이트
      await this.userRepository.findOneAndUpdate(
        { stockId, userId },
        {
          lastActivityTime: dayjs().toISOString(),
          money: user.money - StockConfig.DEFAULT_DRAW_COST,
        },
      );

      // 최종 정보 반환
      return this.stockRepository.findOneById(stockId);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async allUserSellStock(stockId: string): Promise<StockSchemaWithId | null> {
    try {
      const stock = await this.stockRepository.findOneById(stockId);
      const users = await this.userRepository.find({ stockId });

      if (!stock) {
        throw new Error('stock not found');
      }

      if (!users || users.length === 0) {
        throw new Error('users not found');
      }

      const { companies, remainingStocks } = stock;

      const idx = Math.min(
        Math.floor(getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).minutes / stock.fluctuationsInterval),
        9,
      );

      // 각 사용자의 주식 판매 처리
      for (const user of users) {
        let updatedMoney = user.money;
        let updatedStockStorages = [...user.stockStorages];

        // 사용자의 모든 주식 판매 처리
        updatedStockStorages = updatedStockStorages.map((stockStorage) => {
          const companyPrice = companies[stockStorage.companyName][idx]?.가격;
          const totalPrice = companyPrice * stockStorage.stockCountCurrent;

          // 사용자 잔액 증가
          updatedMoney += totalPrice;

          // 재고 업데이트
          const companyRemainingStock = remainingStocks[stockStorage.companyName] || 0;
          remainingStocks[stockStorage.companyName] = companyRemainingStock + stockStorage.stockCountCurrent;

          // 주식 보유량 이력 업데이트
          const updatedStockCountHistory = [...stockStorage.stockCountHistory];
          updatedStockCountHistory[idx] -= stockStorage.stockCountCurrent;

          return {
            ...stockStorage,
            stockCountCurrent: 0,
            stockCountHistory: updatedStockCountHistory,
          };
        });

        // 대출금 상환
        const loanMoney = user.loanCount * StockConfig.SETTLE_LOAN_PRICE;
        updatedMoney -= loanMoney;

        // 사용자 정보 업데이트
        await this.userRepository.findOneAndUpdate(
          { stockId, userId: user.userId },
          {
            loanCount: 0,
            money: updatedMoney,
            stockStorages: updatedStockStorages,
          },
        );
      }

      // 재고 정보 업데이트
      return this.stockRepository.findOneAndUpdate(stockId, {
        remainingStocks,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async saveStockResult(stockId: string): Promise<Result[]> {
    try {
      const stock = await this.stockRepository.findOneById(stockId);
      const users = await this.userRepository.find({ stockId });

      if (!stock) {
        throw new Error('stock not found');
      }

      if (!users || users.length === 0) {
        throw new Error('users not found');
      }

      const resultPromises = users.map((user) => {
        return this.resultService.setResult({
          money: user.money,
          round: stock.round,
          stockId,
          userId: user.userId,
        });
      });

      await Promise.all(resultPromises);

      // 현재 라운드 결과만 반환
      const results = await this.resultService.getResults();
      return results.filter((v) => v.round === stock.round);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteStock(stockId: string): Promise<boolean> {
    try {
      // 관련된 데이터 모두 삭제
      await this.resultService.deleteResult({ stockId });
      await this.logService.deleteAllByStock(stockId);
      await this.userService.removeAllUser(stockId);
      await this.stockRepository.deleteMany({ _id: stockId });

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async setStockPhase(stockId: string, phase: StockPhase): Promise<StockSchemaWithId | null> {
    if (phase === 'INTRO_RESULT') {
      await this.userService.alignIndexByOpenAI(stockId);
    }
    return this.stockRepository.findOneAndUpdate(stockId, { stockPhase: phase });
  }
}
