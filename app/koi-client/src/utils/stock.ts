import { objectEntries } from '@toss/utils';
import { REMAINING_STOCK_THRESHOLD, STOCK_PER_USER } from '../config/stock';

export const getLowSalesCompanies = (
  remainingStocks: Record<string, number>,
  userCount: number,
  stockPerUser = STOCK_PER_USER,
): string[] => {
  const maxQuantity = (userCount ?? 1) * stockPerUser;
  return objectEntries(remainingStocks)
    .filter(([, remaining]) => remaining > maxQuantity * REMAINING_STOCK_THRESHOLD)
    .map(([company]) => company);
};

export const generateNumberFromString = (str: string): number => {
  return str.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
};

export function calculateProfitRate(currentPrice: number, averagePrice: number): number {
  if (averagePrice === 0) return 0;

  const profitRate = ((currentPrice - averagePrice) / averagePrice) * 100;

  return Math.round(profitRate * 100) / 100;
}

interface RenderStockBalloonMessageParams {
  myInfos: Array<{ company: string; timeIdx: number; price: number }>;
  timeIdx: number;
  selectedCompany: string;
}
export const renderStockBalloonMessage = (
  params: RenderStockBalloonMessageParams,
): { firstLine?: string; secondLine?: string } => {
  const { myInfos, timeIdx, selectedCompany } = params;

  if (!selectedCompany) return {};

  const info = myInfos.find((info) => info.timeIdx === (timeIdx ?? 0) + 1 && info.company === selectedCompany);

  const renderFirstLine = (): string => {
    return info?.price
      ? info?.price > 0
        ? '✨ 제 정보에 의하면...'
        : '🧐 제 정보에 의하면...'
      : '🤔 다음엔 오를까요...?';
  };

  const renderSecondLine = (): string => {
    return info?.price
      ? info?.price > 0
        ? '다음 주기에 주가가 오를 것 같아요!'
        : '다음 주기에 주가가 떨어질 것 같아요!'
      : '';
  };

  return {
    firstLine: renderFirstLine(),
    secondLine: renderSecondLine(),
  };
};
