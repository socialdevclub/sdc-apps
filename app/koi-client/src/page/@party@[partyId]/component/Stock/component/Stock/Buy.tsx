import styled from '@emotion/styled';
import { objectEntries, objectValues } from '@toss/utils';
import { Drawer, message } from 'antd';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { COMPANY_NAMES } from 'shared~config/dist/stock';
import { TRADE } from '../../../../../../config/stock';
import { Query } from '../../../../../../hook';
import { UserStore } from '../../../../../../store';
import { calculateProfitRate, renderStockBalloonMessage } from '../../../../../../utils/stock';
import StockCard from './StockCard';
import StockLineChart from './StockLineChart';

interface Props {
  stockId: string;
}

const Buy = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, companiesPrice, timeIdx } = Query.Stock.useQueryStock(stockId);
  const { data: logs } = Query.Stock.useQueryLog({ stockId, userId });
  const { isFreezed, user } = Query.Stock.useUser({ stockId, userId });

  const { mutateAsync: buyStock, isLoading: isBuyLoading } = Query.Stock.useBuyStock();
  const { mutateAsync: sellStock, isLoading: isSellLoading } = Query.Stock.useSellStock();

  const isDesktop = useMediaQuery({ query: `(min-width: 800px)` });

  const [messageApi, contextHolder] = message.useMessage();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const priceData = useMemo(() => {
    const result: Record<string, number[]> = {};
    objectEntries(stock?.companies ?? {}).forEach(([company, companyInfos]) => {
      result[company] = companyInfos.map(({ 가격 }) => 가격);
    });
    return result;
  }, [stock?.companies]);

  const 보유주식 = useMemo(() => {
    return objectEntries(user?.inventory ?? {})
      .filter(([, count]) => count > 0)
      .map(([company, count]) => ({
        company,
        count,
      }));
  }, [user?.inventory]);

  const 미보유주식 = useMemo(() => {
    return objectValues(COMPANY_NAMES).filter((company) => !보유주식.some(({ company: c }) => c === company));
  }, [보유주식]);

  const calculateAveragePurchasePrice = useCallback(
    (company: string, currentQuantity: number) => {
      const myCompanyTradeLog = logs?.filter(({ company: c }) => c === company);
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

      return currentQuantity === 0 ? 0 : 평균매입가격 / currentQuantity;
    },
    [logs],
  );

  if (!stock || !userId || !user) {
    return <>불러오는 중</>;
  }

  const myInfos = objectEntries(stock.companies).reduce((reducer, [company, companyInfos]) => {
    const myInfos = reducer;

    companyInfos.forEach((companyInfo, idx) => {
      if (companyInfos[idx].정보.some((name) => name === userId)) {
        myInfos.push({
          company,
          price: companyInfo.가격 - companyInfos[idx - 1].가격,
          timeIdx: idx,
        });
      }
    });

    return reducer;
  }, [] as Array<{ company: string; timeIdx: number; price: number }>);

  const handleOpenDrawer = (company: string) => {
    setSelectedCompany(company);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedCompany('');
    setDrawerOpen(false);
  };

  const onClickBuy = (company: string) => {
    buyStock({ amount: 1, company, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: '주식을 구매하였습니다.',
          duration: 2,
          type: 'success',
        });
      })
      .catch((reason: Error) => {
        messageApi.destroy();
        messageApi.open({
          content: `${reason.message}`,
          duration: 2,
          type: 'error',
        });
      });
  };

  const onClickSell = (company: string, amount = 1) => {
    sellStock({ amount, company, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: `주식을 ${amount > 1 ? `${amount}주 ` : ''}판매하였습니다.`,
          duration: 2,
          type: 'success',
        });
      })
      .catch((reason: Error) => {
        messageApi.destroy();
        messageApi.open({
          content: `${reason.message}`,
          duration: 2,
          type: 'error',
        });
      });
  };

  const isLoading = isBuyLoading || isFreezed || isSellLoading;
  const isDisabled = timeIdx === undefined || timeIdx >= 9 || !stock.isTransaction || isLoading;

  return (
    <>
      {contextHolder}
      {보유주식.length > 0 && (
        <>
          <SectionTitle>보유 중인 주식</SectionTitle>
          {보유주식.map(({ company, count }) => (
            <StockCard
              key={company}
              company={company}
              quantity={count}
              onClick={() => handleOpenDrawer(company)}
              isActive={company === selectedCompany}
            />
          ))}
          <Divider />
        </>
      )}
      <SectionTitle>보유하지 않은 주식</SectionTitle>
      {미보유주식.map((company) => (
        <StockCard
          key={company}
          company={company}
          quantity={0}
          onClick={() => handleOpenDrawer(company)}
          isActive={company === selectedCompany}
        />
      ))}
      <Drawer
        placement="bottom"
        onClose={handleCloseDrawer}
        open={drawerOpen}
        height="auto"
        closeIcon={false}
        afterOpenChange={(visible) => {
          if (visible) {
            const timer = setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 300);
            return () => clearTimeout(timer);
          }
          return () => {};
        }}
        styles={{
          body: {
            padding: '28px 0 0 0',
          },
          content: {
            backgroundColor: '#252836',
            borderRadius: '16px 16px 0 0',
            margin: '0 auto',
            maxWidth: isDesktop ? '400px' : '100%',
          },
          header: {
            padding: '0',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <StockDetailHeader
          selectedCompany={selectedCompany}
          stockPrice={selectedCompany ? companiesPrice[selectedCompany] : 0}
          stockProfitRate={
            selectedCompany
              ? calculateProfitRate(
                  companiesPrice[selectedCompany],
                  calculateAveragePurchasePrice(
                    selectedCompany,
                    보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
                  ),
                )
              : 0
          }
          quantity={보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0}
        />
        <MessageBalloon {...renderStockBalloonMessage({ myInfos, selectedCompany, timeIdx: timeIdx ?? 0 })} />
        <StockLineChart
          company={selectedCompany}
          priceData={selectedCompany ? priceData[selectedCompany].slice(0, (timeIdx ?? 0) + 1) : [100000]}
          fluctuationsInterval={stock.fluctuationsInterval}
          averagePurchasePrice={calculateAveragePurchasePrice(
            selectedCompany,
            보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
          )}
        />
        <ButtonContainer>
          <Flex>
            <BuyButton onClick={() => onClickBuy(selectedCompany)} disabled={isDisabled}>
              사기
            </BuyButton>
            <SellButton onClick={() => onClickSell(selectedCompany)} disabled={isDisabled}>
              팔기
            </SellButton>
          </Flex>
          <SellAllButton
            onClick={() =>
              onClickSell(selectedCompany, 보유주식.find(({ company }) => company === selectedCompany)?.count)
            }
            disabled={isDisabled}
          >
            모두 팔기
          </SellAllButton>
        </ButtonContainer>
      </Drawer>
    </>
  );
};

export default Buy;

interface StockDetailHeaderProps {
  selectedCompany: string;
  stockPrice: number;
  stockProfitRate: number;
  quantity: number;
}

function StockDetailHeader({ selectedCompany, stockPrice, stockProfitRate, quantity }: StockDetailHeaderProps) {
  const isProfit = stockProfitRate >= 0;

  return (
    <Container>
      <FlexRow>
        <FlexColumn>
          <CompanyName>{selectedCompany}</CompanyName>
          <Quantity>보유 주식: {quantity}</Quantity>
        </FlexColumn>
        <FlexColumn style={{ alignItems: 'flex-end', rowGap: '16px' }}>
          <StockPrice>{stockPrice.toLocaleString()}원</StockPrice>
          <Badge>
            <StockProfitRate>
              {isProfit ? '+' : ''}
              {stockProfitRate}% 수익 중
            </StockProfitRate>
          </Badge>
        </FlexColumn>
      </FlexRow>
    </Container>
  );
}

interface MessageBalloonProps {
  firstLine?: string;
  secondLine?: string;
}

function MessageBalloon({ firstLine, secondLine }: MessageBalloonProps) {
  if (!firstLine) return null;

  return (
    <BalloonBox>
      <Triangle />
      <Message>
        <span>{firstLine}</span>
        {secondLine && <span>{secondLine}</span>}
      </Message>
    </BalloonBox>
  );
}

// Buy - Section 스타일링
const SectionTitle = styled.h4`
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
  margin: 4px 0 12px 4px;
  color: white;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #374151;
  margin: 8px 0 16px 0;
`;

// StockDetailHeader 컴포넌트 스타일링
const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const FlexRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  row-gap: 4px;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  row-gap: 4px;
`;

const CompanyName = styled.p`
  font-size: 20px;
  line-height: 22px;
  font-weight: 500;
  margin: 0;
  color: white;
`;

const Quantity = styled.p`
  font-size: 12px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: #d1d5db;
  margin: 0;
`;

const StockPrice = styled.span`
  font-size: 32px;
  line-height: 20px;
  font-weight: 400;
  color: white;
`;

const Badge = styled.div`
  padding: 4px 8px;
  background-color: #3e4e37;
  border-radius: 100px;
`;

const StockProfitRate = styled.span`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: #a3e635;
  opacity: 1;
`;

// MessageBalloon 컴포넌트 스타일링
const BalloonBox = styled.div`
  padding-left: 20px;
  position: relative;
`;

const Triangle = styled.div`
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid #111827;
  background-color: #252836;
  margin-left: 14px;
`;

const Message = styled.div`
  width: fit-content;
  height: fit-content;
  background-color: #111827;
  border-radius: 8px;
  padding: 12px 18px 12px 12px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  row-gap: 6px;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.5px;
  font-weight: 400;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

// Buy - ButtonContainer 스타일링
const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  row-gap: 8px;
  padding: 0 16px 12px 16px;
`;

const Flex = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 6px;
`;

const BuyButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: #007aff;
  color: white;
  border-radius: 4px;
  border: none;
  font-family: DungGeunMo;
  font-size: 14px;
  line-height: 16px;
  :disabled {
    opacity: 0.5;
  }
`;

const SellButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: #f63c6b;
  color: white;
  border-radius: 4px;
  border: none;
  font-family: DungGeunMo;
  font-size: 14px;
  line-height: 16px;
  :disabled {
    opacity: 0.5;
  }
`;

const SellAllButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: #374151;
  color: white;
  border-radius: 4px;
  border: none;
  font-family: DungGeunMo;
  font-size: 14px;
  line-height: 16px;
  :disabled {
    opacity: 0.5;
  }
`;
