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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', width: '100%' }}>
      {Object.entries(portfolios).map(([timeIdx, companyPortfolio]) => {
        const portfolioData = Object.entries(companyPortfolio).map(([company, { stockPrice, profitRate }]) => {
          return {
            label: `${company} (${profitRate}%)`,
            value: stockPrice,
          };
        });

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
