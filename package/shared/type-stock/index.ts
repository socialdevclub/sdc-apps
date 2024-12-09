export type * as Request from './Request';
export type * as Response from './Response';

export type StockUserRequired = 'stockId' | 'userId';
export type StockUserOmitted = 'lastActivityTime';
export type StockUserForm = Pick<StockUserSchema, StockUserRequired> &
  Partial<Omit<StockUserSchema, StockUserRequired | StockUserOmitted>>;
export type StockUserSchema = {
  stockId: string;
  userId: string;
  money: number;
  inventory: Record<string, number>;
  lastActivityTime: Date;
};

const StockPhase = {
  CROWDING: 'CROWDING',
  PLAYING: 'PLAYING',
  RESULT: 'RESULT',
  WAITING: 'WAITING',
} as const;
export type StockPhase = (typeof StockPhase)[keyof typeof StockPhase];

export type CompanyInfo = {
  가격: number;
  정보: string[];
};

export type StockSchema = {
  stockPhase: StockPhase;
  startedTime: Date;
  companies: Record<string, CompanyInfo[]>;
  remainingStocks: Record<string, number>;
  isVisibleRank: boolean;
  isTransaction: boolean;
  /**
   * 빠른거래제한, 초 단위
   */
  transactionInterval: number;
  /**
   * 주식 시세 변동, 분 단위
   */
  fluctuationsInterval: number;
  /**
   * 0라운드 - 연습게일
   * 1라운드 - 본선게임
   * 2라운드 - 본선게임
   */
  round: number;
};
export type StockSchemaWithId = StockSchema & { _id: string };

export type StockLogAction = 'BUY' | 'SELL';
export type StockLogSchema = {
  stockId: string;
  userId: string;
  date: Date;
  action: StockLogAction;
  company: string;
  price: number;
  quantity: number;
};

export type ResultSchema = {
  stockId: string;
  userId: string;
  round: number;
  money: number;
};
