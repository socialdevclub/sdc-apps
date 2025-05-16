import { useMemo } from 'react';
import useQueryStock from './useQueryStock'; // 경로는 실제 프로젝트 구조에 맞게 수정해주세요

interface PriceHistory {
  가격: number;
}

interface StockData {
  companies: {
    [key: string]: PriceHistory[];
  };
}

/**
 * 각 주식의 변화 정보를 나타내는 인터페이스
 * @interface StockChange
 */
interface StockChange {
  /** 회사 이름 (예: "고양기획🐈") */
  companyName: string;
  /** 현재 1주당 가격 */
  currentPrice: number;
  /** 이전 라운드 가격 */
  previousPrice: number;
  /** 1주당 이전 금액 대비 이익/손실 액 (현재가 - 이전가) */
  priceChange: number;
  /** 1주당 이전 금액 대비 이익/손실 퍼센트 ((현재가 - 이전가) / 이전가) * 100 */
  priceChangePercentage: number;
}

/**
 * useStockChanges 훅의 파라미터 인터페이스
 * @interface Props
 */
interface Props {
  /** 주식 게임의 고유 ID */
  stockId: string | undefined;
}

interface ReturnType {
  isLoading: boolean;
  stockChanges: StockChange[];
  timeIdx: number | undefined;
}

/**
 * 주식 가격 변화를 계산하는 커스텀 훅
 *
 * @param props - 훅 파라미터 객체
 * @returns 각 주식의 변화 정보, 로딩 상태를 포함하는 객체
 *
 * @example
 * // 기본 사용법
 * const { stockChanges, isLoading } = useStockChanges({
 *   stockId: '7c623500-5517-4cfe-ad89-243fef5ec9a9'
 * });
 *
 * // 로딩 상태 처리
 * if (isLoading) {
 *   return <div>로딩 중...</div>;
 * }
 *
 * // 주식 변화 정보 사용
 * return (
 *   <div>
 *     <ul>
 *       {stockChanges.map(stock => (
 *         <li key={stock.companyName}>
 *           {stock.companyName}: {stock.currentPrice}원,
 *           변동 {stock.priceChange > 0 ? '+' : ''}{stock.priceChange}원
 *           ({stock.priceChangePercentage > 0 ? '+' : ''}{stock.priceChangePercentage.toFixed(2)}%)
 *         </li>
 *       ))}
 *     </ul>
 *   </div>
 * );
 */
export const useStockChanges = ({ stockId }: Props): ReturnType => {
  // 주식 정보 가져오기
  const { companiesPrice, data: stockData, timeIdx } = useQueryStock(stockId);

  // 주식 변화 정보 계산
  const stockChanges = useMemo<StockChange[]>(() => {
    if (!stockData || !companiesPrice || timeIdx === undefined) {
      return [];
    }

    // 각 회사별 주식 변화 정보 계산
    return Object.entries(stockData.companies).map(([companyName, priceHistory]) => {
      const typedPriceHistory = priceHistory as PriceHistory[];
      // 현재 가격 (현재 라운드 기준)
      const currentPrice = companiesPrice[companyName] || 0;

      // 이전 라운드 가격 계산
      // timeIdx가 0이면 초기 가격 사용, 그렇지 않으면 이전 라운드 가격 사용
      const previousRoundIdx = timeIdx > 0 ? timeIdx - 1 : 0;
      const previousPrice = timeIdx > 0 ? typedPriceHistory[previousRoundIdx].가격 : typedPriceHistory[0].가격;

      // 가격 변동 계산
      const priceChange = currentPrice - previousPrice;

      // 변동률 계산 (퍼센트)
      const priceChangePercentage = previousPrice > 0 ? Number(((priceChange / previousPrice) * 100).toFixed(1)) : 0;

      return {
        companyName,
        currentPrice,
        previousPrice,
        priceChange,
        priceChangePercentage,
      };
    });
  }, [stockData, companiesPrice, timeIdx]);

  return {
    isLoading: !stockData || !companiesPrice || timeIdx === undefined,
    stockChanges,
    timeIdx, // 현재 라운드 인덱스도 반환
  };
};

export default useStockChanges;
