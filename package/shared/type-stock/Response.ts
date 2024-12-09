import { StockLogSchema, ResultSchema, StockSchema, StockUserSchema } from '.';

export type UploadAvatar = {
  // Express 타입을 왜 못찾을까?
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  file: Express.Multer.File;
};

export type GetStock = Omit<StockSchema, 'startedTime'> & {
  _id?: string;
  startedTime: string;
};

export type GetStockPhase = {
  stockPhase: StockSchema['stockPhase'];
};

export type GetStockUser = Omit<StockUserSchema, 'lastActivityTime'> & {
  lastActivityTime: string;
};

export type Stock = StockSchema;

export type Log = StockLogSchema;

export type Result = ResultSchema;
