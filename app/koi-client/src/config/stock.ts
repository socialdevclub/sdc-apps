export const DEFAULT_FLUCTUATION_INTERVAL = 5;

export const STOCK_PER_USER = 3;

export const TOTAL_ROUND_COUNT = 10;

export const REMAINING_STOCK_THRESHOLD = 0.9;

export const TRADE = {
  BUY: 'BUY',
  SELL: 'SELL',
} as const;

export type Trade = (typeof TRADE)[keyof typeof TRADE];
