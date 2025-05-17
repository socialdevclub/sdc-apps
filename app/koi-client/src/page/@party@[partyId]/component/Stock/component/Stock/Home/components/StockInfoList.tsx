import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { objectEntries } from '@toss/utils';
import { MessageInstance } from 'antd/es/message/interface';
import useStockHoldings from '../../../../../../../../hook/query/Stock/useStockHoldings.tsx';
import { H3, TitleWrapper } from '../Home.styles.tsx';
import StockInfoCard from '../../../../../../../../component-presentation/StockInfoCard.tsx';
import { useQueryStock } from '../../../../../../../../hook/query/Stock';
import { getStockMessages } from '../../../../../../../../utils/stock.ts';
import StockDrawer from '../../StockDrawer.tsx';

interface StockHoldingsListProps {
  stockId: string;
  userId: string;
  messageApi: MessageInstance;
}

export const StockHoldingsList = ({ stockId, userId, messageApi }: StockHoldingsListProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const { holdings } = useStockHoldings({ stockId, userId });

  const { data: stock, timeIdx } = useQueryStock(stockId);

  const priceData = useMemo(() => {
    const result: Record<string, number[]> = {};
    objectEntries(stock?.companies ?? {}).forEach(([company, companyInfos]) => {
      result[company] = companyInfos.map(({ 가격 }) => 가격);
    });
    return result;
  }, [stock?.companies]);

  if (!stock || !userId) {
    return <>불러오는 중</>;
  }

  const myInfos = objectEntries(stock.companies).flatMap(([company, companyInfos]) =>
    companyInfos.reduce((acc, companyInfo, idx) => {
      if (companyInfo.정보.includes(userId)) {
        acc.push({
          company,
          price: idx > 0 ? companyInfo.가격 - companyInfos[idx - 1].가격 : 0,
          timeIdx: idx,
        });
      }
      return acc;
    }, [] as Array<{ company: string; timeIdx: number; price: number }>),
  );

  const stockMessages = getStockMessages({
    companyName: selectedCompany,
    currentTimeIdx: timeIdx ?? 0,
    stockInfos: myInfos,
  });

  const handleOpenDrawer = (company: string) => {
    setSelectedCompany(company);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedCompany('');
    setDrawerOpen(false);
  };

  return (
    <>
      <TitleWrapper>
        <H3> 보유중인 주식</H3>
      </TitleWrapper>
      <Space />
      <Container>
        {holdings.length > 0 ? (
          holdings.map((stock) => (
            <StockInfoCard
              key={stock.companyName}
              companyName={stock.companyName}
              stockCount={stock.stockCount}
              onClick={handleOpenDrawer}
              totalValue={stock.totalValue}
              profitLoss={stock.profitLoss}
              profitLossPercentage={parseFloat(stock.profitLossPercentage.toFixed(1))}
            />
          ))
        ) : (
          <Label>보유중인 주식이 없습니다.</Label>
        )}
      </Container>
      <StockDrawer
        drawerOpen={drawerOpen}
        handleCloseDrawer={handleCloseDrawer}
        selectedCompany={selectedCompany}
        stockMessages={stockMessages}
        priceData={priceData}
        stockId={stockId}
        messageApi={messageApi}
      />
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
const Label = styled.span`
  font-size: 15px;
  color: gray;
`;
