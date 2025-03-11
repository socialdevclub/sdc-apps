import { objectEntries } from '@toss/utils';
import { REMAINING_STOCK_THRESHOLD, STOCK_PER_USER, TRADE } from '../config/stock';

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

  return Math.round(profitRate * 10) / 10;
}

/**
 * 주식 정보 메시지 타입
 */
export enum StockMessageType {
  RISE = 'RISE', // 주가 상승 예상
  FALL = 'FALL', // 주가 하락 예상
  UNKNOWN = 'UNKNOWN', // 정보 없음
}

/**
 * 주식 정보 메시지 생성 함수 파라미터
 */
export interface GetStockMessagesParams {
  stockInfos: Array<{
    company: string;
    timeIdx: number;
    price: number;
  }>;
  currentTimeIdx: number;
  companyName: string;
}

/**
 * 주식 정보에 따른 메시지 배열을 생성합니다.
 *
 * @param params 메시지 생성에 필요한 파라미터
 * @returns 메시지 문자열 배열
 */
export const getStockMessages = (params: GetStockMessagesParams): string[] => {
  const { stockInfos, currentTimeIdx, companyName } = params;

  if (!companyName) return [];

  // 다음 주기의 주식 정보 찾기
  const nextInfo = stockInfos.find((info) => info.timeIdx === currentTimeIdx + 1 && info.company === companyName);

  // 정보가 없는 경우
  if (!nextInfo) {
    return ['🤔 다음엔 오를까요...?'];
  }

  // 주가 상승 예상
  if (nextInfo.price > 0) {
    return ['✨ 제 정보에 의하면...', '다음 주기에 주가가 오를 것 같아요!'];
  }

  // 주가 하락 예상
  if (nextInfo.price < 0) {
    return ['🧐 제 정보에 의하면...', '다음 주기에 주가가 떨어질 것 같아요!'];
  }

  return ['🤔 다음엔 오를까요...?'];
};

interface CalculateAveragePurchasePriceParams {
  logs: Array<{ company: string; date: Date; price: number; quantity: number; action: string; round: number }>;
  company: string;
  currentQuantity: number;
  round?: number;
}

export const calculateAveragePurchasePrice = (params: CalculateAveragePurchasePriceParams): number => {
  const { logs, company, currentQuantity, round } = params;

  const myCompanyTradeLog = logs?.filter(({ company: c, round: r }) => c === company && r === round);
  const sortedTradeLog = myCompanyTradeLog?.sort((a, b) => a.date.getTime() - b.date.getTime());

  let count = 0;

  const 평균매입가격 = sortedTradeLog?.reduce((acc, curr) => {
    if (curr.action === TRADE.BUY) {
      count += curr.quantity;
      return acc + curr.price * curr.quantity;
    }
    if (curr.action === TRADE.SELL) {
      const currentCount = count;
      count -= curr.quantity;
      return acc - (acc / currentCount) * curr.quantity;
    }
    return acc;
  }, 0);

  return currentQuantity === 0 ? 0 : Math.round(평균매입가격 / currentQuantity);
};
