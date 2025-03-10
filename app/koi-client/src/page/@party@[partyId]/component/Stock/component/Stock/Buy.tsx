import styled from '@emotion/styled';
import { objectEntries, objectValues } from '@toss/utils';
import { Drawer, message } from 'antd';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { COMPANY_NAMES } from 'shared~config/dist/stock';
import ButtonGroup from '../../../../../../component-presentation/ButtonGroup';
import InfoHeader from '../../../../../../component-presentation/InfoHeader';
import MessageBalloon from '../../../../../../component-presentation/MessageBalloon';
import StockCard from '../../../../../../component-presentation/StockCard';
import StockLineChart from '../../../../../../component-presentation/StockLineChart';
import { Query } from '../../../../../../hook';
import { UserStore } from '../../../../../../store';
import { calculateAveragePurchasePrice, calculateProfitRate, getStockMessages } from '../../../../../../utils/stock';

const renderProfitBadge = (stockProfitRate: number | null) => {
  if (stockProfitRate === null) {
    return {
      backgroundColor: 'rgba(148, 163, 184, 0.2)',
      color: '#94A3B8',
      text: '해당 주식이 없어요',
    };
  }
  if (stockProfitRate > 0) {
    return {
      backgroundColor: 'rgba(163, 230, 53, 0.2)',
      color: '#a3e635',
      text: `+${stockProfitRate}% 수익 중`,
    };
  }
  if (stockProfitRate < 0) {
    return {
      backgroundColor: 'rgba(220, 38, 38, 0.2)',
      color: '#DC2626',
      text: `${stockProfitRate}% 손실 중`,
    };
  }
  return {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    color: '#94A3B8',
    text: '0% 변동 없음',
  };
};

interface Props {
  stockId: string;
}

const Buy = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, companiesPrice, timeIdx } = Query.Stock.useQueryStock(stockId);
  const round = stock?.round;
  const { data: logs } = Query.Stock.useQueryLog({ round, stockId, userId });
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

  if (!stock || !userId || !user) {
    return <>불러오는 중</>;
  }

  const myInfos = objectEntries(stock.companies).flatMap(([company, companyInfos]) => {
    const acc: Array<{ company: string; timeIdx: number; price: number }> = [];

    companyInfos.forEach((companyInfo, idx) => {
      if (companyInfos[idx].정보.some((name) => name === userId)) {
        acc.push({
          company,
          price: companyInfo.가격 - companyInfos[idx - 1].가격,
          timeIdx: idx,
        });
      }
    });

    return acc;
  });

  const stockProfitRate =
    selectedCompany && 보유주식.find(({ company }) => company === selectedCompany)
      ? calculateProfitRate(
          companiesPrice[selectedCompany],
          calculateAveragePurchasePrice({
            company: selectedCompany,
            currentQuantity: 보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
            logs,
            round,
          }),
        )
      : null;

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
              company={company.slice(0, 4)}
              quantity={count}
              onClick={() => handleOpenDrawer(company)}
              isActive={company === selectedCompany}
            />
          ))}
          {미보유주식.length > 0 && <Divider />}
        </>
      )}
      {미보유주식.length > 0 && (
        <>
          <SectionTitle>보유하지 않은 주식</SectionTitle>
          {미보유주식.map((company) => (
            <StockCard
              key={company}
              company={company.slice(0, 4)}
              quantity={0}
              onClick={() => handleOpenDrawer(company)}
              isActive={company === selectedCompany}
            />
          ))}
        </>
      )}
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
          title={selectedCompany.slice(0, 4)}
          subtitle={`보유 주식: ${보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0}`}
          value={selectedCompany ? companiesPrice[selectedCompany] : 0}
          valueFormatted={`${selectedCompany ? companiesPrice[selectedCompany].toLocaleString() : 0}원`}
          badge={renderProfitBadge(stockProfitRate)}
        />
        <MessageBalloon messages={stockMessages} />
        <StockLineChart
          company={selectedCompany}
          priceData={selectedCompany ? priceData[selectedCompany].slice(0, (timeIdx ?? 0) + 1) : [100000]}
          fluctuationsInterval={stock.fluctuationsInterval}
          averagePurchasePrice={calculateAveragePurchasePrice({
            company: selectedCompany,
            currentQuantity: 보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
            logs,
            round,
          })}
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
