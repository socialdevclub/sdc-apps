import React, { useMemo } from 'react';
import { Response, StockSchemaWithId } from 'shared~type-stock';
import DoughnutChart from '../../../../../../component-presentation/DoughnutChart';
import { calculateAllPortfolios } from '../../../../../../utils/stock';

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
        const totalStockAmount = Object.values(companyPortfolio).reduce((acc, curr) => acc + curr.stockPrice, 0);
        const portfolioData = Object.entries(companyPortfolio).map(([company, { stockPrice }]) => {
          const stockPriceRatio = Math.round((stockPrice / totalStockAmount) * 100 * 10) / 10;
          return {
            label: `${company} (${stockPriceRatio}%)`,
            value: stockPrice,
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
              <DoughnutChart height="700px" data={portfolioData} containerHeight="500px" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultRealism;
