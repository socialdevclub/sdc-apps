import type { ProjectionType, QueryOptions } from 'mongoose';
import type { CompanyInfo, StockPhase, StockSchema, StockSchemaWithId, StockUserRequired, StockUserSchema } from '.';

export type GetStock = {
  stockId: string;
  projection?: ProjectionType<StockSchemaWithId>;
};

export type PatchUpdateStock = Partial<StockSchema> & { _id: string };

export type GetFindStockUser = {
  filter: StockUserSchema;
  projection?: ProjectionType<StockUserSchema>;
};

export type PostBuyStock = {
  stockId: string;
  userId: string;
  company: string;
  amount: number;
  unitPrice: number;
  round: number;
  queueUniqueId?: string;
};

export type PostDrawStockInfo = {
  stockId: string;
  userId: string;
};

export type PostSellStock = {
  stockId: string;
  userId: string;
  company: string;
  amount: number;
  unitPrice: number;
  round: number;
  queueUniqueId?: string;
};

export type PostLoan = {
  stockId: string;
  userId: string;
};

export type PostSettleLoan = {
  stockId: string;
  userId: string;
};

export type RemoveStockUser = {
  stockId: string;
  userId: string;
};

export type RemoveAllStockUser = {
  stockId: string;
};

export type GetStockList = QueryOptions<StockSchema>;

export type PostIntroduce = {
  stockId: string;
  userId: string;
  introduction: string;
};

export type PostSetStockPhase = {
  stockId: string;
  phase: StockPhase;
};

export type PostStockInit =
  | {
      isCustomInfo: true;
      companies: Record<string, CompanyInfo[]>;
    }
  | {
      isCustomInfo?: false;
      companies?: Record<string, Omit<CompanyInfo, '정보'>[]>;
    };

export type PostCreateUser = Pick<StockUserSchema, StockUserRequired> &
  Omit<Partial<StockUserSchema>, StockUserRequired>;
