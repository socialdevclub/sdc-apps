import styled from '@emotion/styled';
import { objectEntries, objectValues } from '@toss/utils';
import { Drawer, message } from 'antd';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { COMPANY_NAMES } from 'shared~config/dist/stock';
import ButtonGroup from '../../../../../../component-presentation/ButtonGroup';
import InfoHeader from '../../../../../../component-presentation/InfoHeader';
import MessageBalloon from '../../../../../../component-presentation/MessageBalloon';
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

  const stockProfitRate = selectedCompany
    ? calculateProfitRate(
        companiesPrice[selectedCompany],
        calculateAveragePurchasePrice(
          selectedCompany,
          보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
        ),
      )
    : 0;

  const isProfit = stockProfitRate >= 0;

  const messageInfo = renderStockBalloonMessage({
    myInfos,
    selectedCompany,
    timeIdx: timeIdx ?? 0,
  });

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
        <InfoHeader
          title={selectedCompany}
          subtitle={`보유 주식: ${보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0}`}
          value={selectedCompany ? companiesPrice[selectedCompany] : 0}
          valueFormatted={`${selectedCompany ? companiesPrice[selectedCompany].toLocaleString() : 0}원`}
          badge={{
            backgroundColor: '#3e4e37',
            color: '#a3e635',
            text: `${isProfit ? '+' : ''}${stockProfitRate}% 수익 중`,
          }}
        />
        <MessageBalloon messages={[messageInfo.firstLine, messageInfo.secondLine].filter(Boolean)} />
        <StockLineChart
          company={selectedCompany}
          priceData={selectedCompany ? priceData[selectedCompany].slice(0, (timeIdx ?? 0) + 1) : [100000]}
          fluctuationsInterval={stock.fluctuationsInterval}
          averagePurchasePrice={calculateAveragePurchasePrice(
            selectedCompany,
            보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
          )}
        />

        <ButtonGroup
          buttons={[
            {
              backgroundColor: '#007aff',
              disabled: isDisabled,
              flex: 1,
              onClick: () => onClickBuy(selectedCompany),
              text: '사기',
            },
            {
              backgroundColor: '#f63c6b',
              disabled: isDisabled,
              flex: 1,
              onClick: () => onClickSell(selectedCompany),
              text: '팔기',
            },
          ]}
          direction="row"
          padding="0 16px 8px 16px"
        />

        <ButtonGroup
          buttons={[
            {
              backgroundColor: '#374151',
              disabled: isDisabled,
              onClick: () =>
                onClickSell(selectedCompany, 보유주식.find(({ company }) => company === selectedCompany)?.count),
              text: '모두 팔기',
            },
          ]}
          padding="0 16px 12px 16px"
        />
      </Drawer>
    </>
  );
};

export default Buy;

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
