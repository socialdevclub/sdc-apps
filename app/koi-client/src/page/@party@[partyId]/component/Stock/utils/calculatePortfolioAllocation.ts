import { Response, StockSchemaWithId } from 'shared~type-stock';

/**
 * 특정 연차의 포트폴리오 구성 비중을 계산해요
 * @param stock 주식 데이터
 * @param user 사용자 데이터
 * @param year 연차 (0부터 시작)
 * @returns 포트폴리오 구성 정보
 */
export function calculatePortfolioAllocation(
  stock: StockSchemaWithId,
  user: Response.GetStockUser,
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
