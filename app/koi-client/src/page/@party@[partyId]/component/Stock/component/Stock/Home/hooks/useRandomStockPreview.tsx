import { objectEntries } from '@toss/utils';
import { GetStock } from 'shared~type-stock/Response';
import { Query } from '../../../../../../../../hook';

const REMAINING_STOCK_THRESHOLD = 0.9;
const STOCK_PER_USER = 3;
const TOTAL_ROUND_COUNT = 10;

// 문자열에서 숫자 생성 함수
const generateNumberFromString = (str: string): number => {
  return str.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
};

// 판매량이 낮은 회사 필터링
const getLowSalesCompanies = (
  remainingStocks: Record<string, number>,
  userCount: number,
  stockPerUser = STOCK_PER_USER,
): string[] => {
  const maxQuantity = (userCount ?? 1) * stockPerUser;
  return objectEntries(remainingStocks)
    .filter(([, remaining]) => remaining > maxQuantity * REMAINING_STOCK_THRESHOLD)
    .map(([company]) => company);
};

export const useRandomStockPreview = (
  stockId: string,
  userId?: string,
  timeIdx?: number,
  stock?: GetStock,
): {
  nextRoundPredict: { companyName: string; predictTime: number; priceVariation: number } | null;
  TOTAL_ROUND_COUNT: number;
} => {
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));

  if (!stock || !userId) {
    return { TOTAL_ROUND_COUNT, nextRoundPredict: null };
  }

  const lowSalesCompanies = getLowSalesCompanies(stock.remainingStocks, profiles?.data?.length ?? 1);

  const getPredictedStockInfo = (): { companyName: string; predictTime: number; priceVariation: number } | null => {
    const _timeIdx = timeIdx ?? 0;

    if (_timeIdx < 0 || _timeIdx >= TOTAL_ROUND_COUNT - 1 || lowSalesCompanies.length === 0) {
      return null;
    }

    const randomIndex = generateNumberFromString(`${stockId}-${_timeIdx}-${userId}`) % lowSalesCompanies.length;
    const companyName = lowSalesCompanies[randomIndex];

    return {
      companyName,
      predictTime: stock.fluctuationsInterval ? (_timeIdx + 1) * stock.fluctuationsInterval : 0,
      priceVariation: Math.abs(
        (stock.companies?.[companyName]?.[_timeIdx + 1]?.가격 ?? 0) -
          (stock.companies?.[companyName]?.[_timeIdx]?.가격 ?? 0),
      ),
    };
  };

  const nextRoundPredict = getPredictedStockInfo();

  return {
    TOTAL_ROUND_COUNT,
    nextRoundPredict,
  };
};
