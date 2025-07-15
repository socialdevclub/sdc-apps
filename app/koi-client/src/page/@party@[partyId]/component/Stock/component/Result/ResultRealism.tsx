import React, { useMemo } from 'react';
import { Response, StockSchemaWithId } from 'shared~type-stock';
import DoughnutChart from '../../../../../../component-presentation/DoughnutChart';
import { calculateAllPortfolios, formatPercentage } from '../../../../../../utils/stock';

interface ResultRealismProps {
  stock: StockSchemaWithId;
  user: Response.GetStockUser;
}

const ResultRealism = ({ stock, user }: ResultRealismProps) => {
  const portfolios = useMemo(
    () =>
      calculateAllPortfolios({
        companies: stock.companies,
        stockStorages: user.stockStorages,
      }),
    [stock.companies, user.stockStorages],
  );
  const portfolioList = useMemo(
    () =>
      Object.entries(portfolios).map(([timeIdx, companyPortfolio]) => {
        const totalStockAmount = Object.values(companyPortfolio).reduce(
          (acc, curr) => acc + curr.stockPrice * curr.stockCount,
          0,
        );
        const portfolioData = Object.entries(companyPortfolio).map(([company, { stockPrice, stockCount }]) => {
          const stockPriceRatio = formatPercentage((stockPrice * stockCount) / totalStockAmount);
          return {
            label: `${company} (${stockPriceRatio}%)`,
            value: stockPrice * stockCount,
          };
        });
        return { portfolioData, timeIdx, totalStockAmount };
      }),
    [portfolios],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
      {portfolioList.map(({ portfolioData, timeIdx }) => {
        return (
          <div key={timeIdx}>
            <h2 style={{ paddingLeft: '16px' }}>{Number(timeIdx) + 1}년차 포트폴리오</h2>
            <div style={{ width: '100%' }}>
              <DoughnutChart data={portfolioData.filter((v) => v.value > 0)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultRealism;
