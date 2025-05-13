import {
  StockUserForm,
  StockUserRequired,
  StockUserSchema,
  StockUserInfoSchema,
  StockStorageSchema,
} from 'shared~type-stock';
import { StockConfig } from 'shared~config';
import dayjs from 'dayjs';

export class StockUserStorage implements StockStorageSchema {
  companyName: string;

  stockCountCurrent: number;

  stockCountHistory: number[];
}

export class StockUserInfo implements StockUserInfoSchema {
  gender: string;

  nickname: string;

  introduction?: string;
}

export class StockUser implements StockUserSchema {
  stockId: string;

  userId: string;

  userInfo: StockUserInfoSchema;

  index: number;

  money: number;

  lastActivityTime: string;

  loanCount: number;

  stockStorages: StockStorageSchema[];

  resultByRound: number[];

  constructor(required: Pick<StockUserSchema, StockUserRequired>, partial: StockUserForm) {
    this.userId = required.userId;
    this.stockId = required.stockId;
    this.userInfo = required.userInfo;

    this.index = partial.index ?? 0;
    this.money = partial.money ?? StockConfig.INIT_USER_MONEY;
    this.lastActivityTime = dayjs().toISOString();
    this.loanCount = partial.loanCount ?? 0;

    const companies = StockConfig.getRandomCompanyNames();
    const stockStorages = companies.map((company) => {
      return {
        companyName: company,
        stockCountCurrent: 0,
        stockCountHistory: new Array(StockConfig.MAX_STOCK_IDX + 1).fill(0),
      } as StockStorageSchema;
    });

    this.stockStorages = partial.stockStorages ?? stockStorages;
    this.resultByRound = [];
  }
}
