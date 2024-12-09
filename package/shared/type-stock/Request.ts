import type { ProjectionType, QueryOptions } from 'mongoose';
import type { StockSchema, StockSchemaWithId } from '.';

export type GetStock = {
  stockId: string;
  projection?: ProjectionType<StockSchemaWithId>;
};

export type PatchUpdateStock = Partial<StockSchema> & { _id: string };

export type PostBuyStock = {
  stockId: string;
  userId: string;
  company: string;
  amount: number;
  unitPrice: number;
};

export type PostSellStock = {
  stockId: string;
  userId: string;
  company: string;
  amount: number;
  unitPrice: number;
};

export type RemoveStockUser = {
  stockId: string;
  userId: string;
};

export type GetStockList = QueryOptions<StockSchema>;
