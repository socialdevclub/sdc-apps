import type { GameSchema } from '.';

export type UpdateGame = Partial<Omit<GameSchema, 'unique'>>;

export type BuyStock = {
  nickname: string;
  company: string;
  amount: number;
  unitPrice: number;
};

export type SellStock = {
  nickname: string;
  company: string;
  amount: number;
  unitPrice: number;
};
