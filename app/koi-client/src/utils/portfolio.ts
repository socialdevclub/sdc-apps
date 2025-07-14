/**
 * 포트폴리오 분석 계산 유틸리티 함수들
 */

// 타입 정의
export interface StockStorage {
  companyName: string;
  stockCountHistory: number[];
}

export interface CompanyPrice {
  가격: number;
  정보: unknown[];
}

export interface Stock {
  companies: Record<string, CompanyPrice[]>;
}

export interface User {
  stockStorages: StockStorage[];
}

// 거래 기록 (FIFO 계산용)
interface Purchase {
  count: number;
  price: number;
}

/**
 * 특정 연차의 포트폴리오 구성 비중을 계산해요
 * @param stock 주식 데이터
 * @param user 사용자 데이터
 * @param year 연차 (0부터 시작)
 * @returns 포트폴리오 구성 정보
 */
export function calculatePortfolioAllocation(
  stock: Stock,
  user: User,
  year: number,
): {
  companies: Array<{ name: string; value: number }>;
  isEmpty: boolean;
} {
  const companiesPortfolio: Array<{ name: string; value: number }> = [];
  let totalPortfolioValue = 0;

  // 각 회사별 누적 보유량 계산
  user.stockStorages.forEach((storage) => {
    const { companyName, stockCountHistory } = storage;
    const companyPrices = stock.companies[companyName];

    if (!companyPrices || year >= stockCountHistory.length) return;

    // 해당 연차까지의 누적 보유량 계산
    let cumulativeHolding = 0;
    for (let i = 0; i <= year; i++) {
      cumulativeHolding += stockCountHistory[i] || 0;
    }

    // 보유량이 양수인 경우만 포트폴리오에 포함
    if (cumulativeHolding > 0 && companyPrices[year]) {
      const portfolioValue = cumulativeHolding * companyPrices[year].가격;
      totalPortfolioValue += portfolioValue;

      companiesPortfolio.push({
        name: companyName,
        value: Math.round(portfolioValue),
      });
    }
  });

  // 포트폴리오가 비어있는 경우
  const isEmpty = totalPortfolioValue === 0;
  if (isEmpty) {
    return {
      companies: [{ name: '보유 주식 없음', value: 1 }],
      isEmpty: true,
    };
  }

  return {
    companies: companiesPortfolio,
    isEmpty: false,
  };
}

/**
 * 전체 포트폴리오의 특정 연차 수익률을 계산해요 (FIFO 방식)
 * @param stock 주식 데이터
 * @param user 사용자 데이터
 * @param year 연차 (0부터 시작)
 * @returns 수익률 (%)
 */
export function calculateTotalPortfolioReturn(stock: Stock, user: User, year: number): number {
  let totalInvestedAmount = 0;
  let totalCurrentValue = 0;
  let totalRealizedProfitLoss = 0;

  // 모든 회사를 대상으로 계산
  user.stockStorages.forEach((storage) => {
    const { companyName, stockCountHistory } = storage;
    const companyPrices = stock.companies[companyName];

    if (!companyPrices || year >= stockCountHistory.length) return;

    let currentHolding = 0;
    let companyInvestedAmount = 0;
    let companyRealizedProfitLoss = 0;
    const purchases: Purchase[] = [];

    // 해당 연도까지의 거래 내역을 누적하여 계산
    for (let i = 0; i <= year; i++) {
      const tradeCount = stockCountHistory[i] || 0;
      const price = companyPrices[i]?.가격 || 0;

      if (tradeCount > 0) {
        // 매수: 투자 비용 증가, 보유량 증가
        companyInvestedAmount += tradeCount * price;
        currentHolding += tradeCount;
        purchases.push({ count: tradeCount, price });
      } else if (tradeCount < 0) {
        // 매도: 실현손익 계산 (FIFO 방식)
        let remainingSellCount = Math.abs(tradeCount);
        currentHolding -= remainingSellCount;

        while (remainingSellCount > 0 && purchases.length > 0) {
          const purchase = purchases[0];
          const sellFromThisPurchase = Math.min(remainingSellCount, purchase.count);

          // 실현손익 = (매도가 - 매수가) * 매도량
          companyRealizedProfitLoss += sellFromThisPurchase * (price - purchase.price);

          purchase.count -= sellFromThisPurchase;
          remainingSellCount -= sellFromThisPurchase;

          if (purchase.count === 0) {
            purchases.shift();
          }
        }
      }
    }

    // 전체 포트폴리오에 반영
    totalInvestedAmount += companyInvestedAmount;
    totalCurrentValue += currentHolding * (companyPrices[year]?.가격 || 0);
    totalRealizedProfitLoss += companyRealizedProfitLoss;
  });

  // 수익률 계산
  if (totalInvestedAmount > 0) {
    const totalAssetValue = totalCurrentValue + totalRealizedProfitLoss;
    const returnRate = ((totalAssetValue - totalInvestedAmount) / totalInvestedAmount) * 100;
    return Math.round(returnRate * 10) / 10;
  }

  return 0;
}

/**
 * 특정 회사의 특정 연차 수익률을 계산해요 (FIFO 방식)
 * @param companyPrices 회사 가격 데이터
 * @param stockCountHistory 거래 이력
 * @param year 연차 (0부터 시작)
 * @returns 수익률 (%)
 */
export function calculateCompanyReturn(
  companyPrices: CompanyPrice[],
  stockCountHistory: number[],
  year: number,
): number {
  if (year >= stockCountHistory.length) {
    return 0;
  }

  let currentHolding = 0;
  let totalInvestedAmount = 0;
  let realizedProfitLoss = 0;
  const purchases: Purchase[] = [];

  // 해당 연도까지의 거래 내역을 누적하여 계산
  for (let i = 0; i <= year; i++) {
    const tradeCount = stockCountHistory[i] || 0;
    const price = companyPrices[i]?.가격 || 0;

    if (tradeCount > 0) {
      // 매수: 투자 비용 증가, 보유량 증가
      totalInvestedAmount += tradeCount * price;
      currentHolding += tradeCount;
      purchases.push({ count: tradeCount, price });
    } else if (tradeCount < 0) {
      // 매도: 실현손익 계산 (FIFO 방식)
      let remainingSellCount = Math.abs(tradeCount);
      currentHolding -= remainingSellCount;

      while (remainingSellCount > 0 && purchases.length > 0) {
        const purchase = purchases[0];
        const sellFromThisPurchase = Math.min(remainingSellCount, purchase.count);

        // 실현손익 = (매도가 - 매수가) * 매도량
        realizedProfitLoss += sellFromThisPurchase * (price - purchase.price);

        purchase.count -= sellFromThisPurchase;
        remainingSellCount -= sellFromThisPurchase;

        if (purchase.count === 0) {
          purchases.shift();
        }
      }
    }
  }

  // 수익률 계산
  if (totalInvestedAmount > 0) {
    // 현재 보유 주식의 시장가치
    const currentMarketValue = currentHolding * (companyPrices[year]?.가격 || 0);

    // 총 자산가치 = 현재 보유 주식 가치 + 실현손익
    const totalAssetValue = currentMarketValue + realizedProfitLoss;

    // 수익률 = (총자산가치 - 총투자액) / 총투자액 * 100
    const returnRate = ((totalAssetValue - totalInvestedAmount) / totalInvestedAmount) * 100;
    return Math.round(returnRate * 10) / 10;
  }

  return 0;
}

/**
 * 0~8년차의 연차별 포트폴리오 구성 데이터를 계산해요
 * @param stock 주식 데이터
 * @param user 사용자 데이터
 * @returns 연차별 포트폴리오 구성 배열
 */
export function calculateInvestmentData(
  stock: Stock,
  user: User,
): Array<{ year: string; companies: Array<{ name: string; value: number }> }> {
  const yearlyData: Array<{ year: string; companies: Array<{ name: string; value: number }> }> = [];

  // 0~8년차 각각의 포트폴리오 구성 계산
  for (let year = 0; year < 9; year++) {
    const allocation = calculatePortfolioAllocation(stock, user, year);

    yearlyData.push({
      companies: allocation.companies,
      year: `${year}년차`,
    });
  }

  return yearlyData;
}

/**
 * 0~9년차의 전체 포트폴리오 수익률 데이터를 계산해요
 * @param stock 주식 데이터
 * @param user 사용자 데이터
 * @returns 연차별 수익률과 연차 라벨
 */
export function calculateTotalReturnsData(stock: Stock, user: User): { returns: number[]; years: string[] } {
  const years = Array.from({ length: 10 }, (_, i) => `${i}년차`);
  const returns: number[] = [];

  for (let year = 0; year < 10; year++) {
    const returnRate = calculateTotalPortfolioReturn(stock, user, year);
    returns.push(returnRate);
  }

  return { returns, years };
}

/**
 * 회사별 연차수익률 데이터를 계산해요
 * @param stock 주식 데이터
 * @param user 사용자 데이터
 * @returns 회사별 연차 수익률과 연차 라벨
 */
export function calculateReturnsData(
  stock: Stock,
  user: User,
): { companies: { name: string; data: number[] }[]; years: string[] } {
  const years = Array.from({ length: 10 }, (_, i) => `${i}년차`);
  const companies: { name: string; data: number[] }[] = [];

  user.stockStorages.forEach((storage) => {
    const { companyName, stockCountHistory } = storage;
    const companyPrices = stock.companies[companyName];

    if (!companyPrices) return;

    const companyReturns: number[] = [];

    // 각 연차별 수익률 계산
    for (let year = 0; year < 10; year++) {
      const returnRate = calculateCompanyReturn(companyPrices, stockCountHistory, year);
      companyReturns.push(returnRate);
    }

    // 의미있는 거래가 있는 회사만 추가
    const hasTrading = companyReturns.some((val) => val !== 0);
    if (hasTrading) {
      companies.push({
        data: companyReturns,
        name: companyName,
      });
    }
  });

  return { companies, years };
}
