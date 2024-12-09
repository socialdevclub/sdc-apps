export type * as Request from './Request';
export type * as Response from './Response';

export type UserSchema = {
  nickname: string;
  money: number;
  inventory: Record<string, number>;
  lastActivityTime: Date;
};

const GamePhase = {
  CROWDING: 'CROWDING',
  PLAYING: 'PLAYING',
  RESULT: 'RESULT',
  WAITING: 'WAITING',
} as const;
export type GamePhase = (typeof GamePhase)[keyof typeof GamePhase];

export type CompanyInfo = {
  가격: number;
  정보: string[];
};

export type GameSchema = {
  unique: boolean;
  gamePhase: GamePhase;
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

export type LogSchema = {
  nickname: string;
  date: Date;
  action: 'BUY' | 'SELL';
  company: string;
  price: number;
  quantity: number;
};

export type ResultSchema = {
  nickname: string;
  round: number;
  money: number;
};
