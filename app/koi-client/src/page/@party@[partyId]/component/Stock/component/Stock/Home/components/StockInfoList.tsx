import styled from '@emotion/styled';
import useStockHoldings from '../../../../../../../../hook/query/Stock/useStockHoldings.tsx';
import { H3, TitleWrapper } from '../Home.styles.tsx';
import StockInfoCard from '../../../../../../../../component-presentation/StockInfoCard.tsx';

interface StockHoldingsListProps {
  stockId: string;
  userId: string | undefined;
}

export const StockHoldingsList = ({ stockId, userId }: StockHoldingsListProps) => {
  const { holdings } = useStockHoldings({ stockId, userId });

  return (
    <>
      <TitleWrapper>
        <H3> 보유중인 주식</H3>
      </TitleWrapper>
      <Space />
      <Container>
        {holdings.map((stock) => (
          <StockInfoCard
            key={stock.companyName}
            companyName={stock.companyName}
            stockCount={stock.stockCount}
            onClick={() => {}}
            totalValue={stock.totalValue}
            profitLoss={stock.profitLoss}
            profitLossPercentage={parseFloat(stock.profitLossPercentage.toFixed(1))}
          />
        ))}
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.6rem;
`;
const Space = styled.div`
  margin-block: 0.5rem;
`;
