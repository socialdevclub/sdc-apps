import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { CompanyInfo, RoomOptions, StockPhase, StockSchema } from 'shared~type-stock';

export class Stock implements StockSchema {
  _id: string;

  stockPhase: StockPhase;

  startedTime: string;

  companies: Record<string, CompanyInfo[]>;

  remainingStocks: Record<string, number>;

  isVisibleRank: boolean;

  isTransaction: boolean;

  transactionInterval: number;

  fluctuationsInterval: number;

  round: number;

  initialMoney: number;

  roomOptions: RoomOptions;

  constructor() {
    this._id = randomUUID();
    this.stockPhase = 'CROWDING';
    this.startedTime = dayjs().toISOString();
    this.remainingStocks = {};
    this.companies = {};
    this.isVisibleRank = false;
    this.isTransaction = false;
    this.transactionInterval = 0;
    this.fluctuationsInterval = 5;
    this.round = 0;
    this.initialMoney = 1000000;
    this.roomOptions = {
      hasLoan: true,
      // maxMarketStockCount: 200,
      // maxPersonalStockCount: 30,
      // maxStockHint: 6,
    };
  }
}
