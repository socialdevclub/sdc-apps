import { Drawer } from 'antd';
import React, { useMemo, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useAtomValue } from 'jotai';
import { isStockOverLimit } from 'shared~config/dist/stock';
import { MessageInstance } from 'antd/es/message/interface';
import { StockConfig } from 'shared~config';
import { MEDIA_QUERY } from '../../../../../../config/common';
import InfoHeader from '../../../../../../component-presentation/InfoHeader';
import { calculateProfitRate, getAnimalImageSource, renderProfitBadge } from '../../../../../../utils/stock';
import MessageBalloon from '../../../../../../component-presentation/MessageBalloon';
import StockLineChart from '../../../../../../component-presentation/StockLineChart';
import ButtonGroup from '../../../../../../component-presentation/ButtonGroup';
import { Query } from '../../../../../../hook';
import { UserStore } from '../../../../../../store';

interface Props {
  drawerOpen: boolean;
  handleCloseDrawer: () => void;
  selectedCompany: string;
  stockMessages: string[];
  priceData: Record<string, number[]>;
  stockId: string;
  messageApi: MessageInstance;
}

const StockDrawer = ({
  drawerOpen,
  handleCloseDrawer,
  selectedCompany,
  stockMessages,
  priceData,
  stockId,
  messageApi,
}: Props) => {
  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { isFreezed, user, getStockStorage } = Query.Stock.useUser({
    stockId,
    userId,
    userRefetchInterval: 500,
  });
  const {
    data: stock,
    companiesPrice,
    timeIdx,
  } = Query.Stock.useQueryStock(stockId, { refetchInterval: Number.POSITIVE_INFINITY });
  const { data: userCount } = Query.Stock.useUserCount({ stockId });

  const stockCountCurrent = getStockStorage(selectedCompany)?.stockCountCurrent;
  const prevStockCountCurrent = useRef<number | undefined>(stockCountCurrent);

  if (prevStockCountCurrent.current !== stockCountCurrent && typeof stockCountCurrent === 'number') {
    if (typeof prevStockCountCurrent.current !== 'number') {
      prevStockCountCurrent.current = stockCountCurrent;
    } else {
      if (stockCountCurrent > prevStockCountCurrent.current) {
        messageApi.destroy();
        messageApi.open({
          content: `주식을 ${stockCountCurrent - prevStockCountCurrent.current}주 구매하였습니다.`,
          duration: 2,
          type: 'success',
        });
      } else if (stockCountCurrent < prevStockCountCurrent.current) {
        messageApi.destroy();
        messageApi.open({
          content: `주식을 ${prevStockCountCurrent.current - stockCountCurrent}주 판매하였습니다.`,
          duration: 2,
          type: 'success',
        });
      }
      prevStockCountCurrent.current = stockCountCurrent;
    }
  }

  const { mutateAsync: buyStock, isLoading: isBuyLoading } = Query.Stock.useBuyStock();
  const { mutateAsync: sellStock, isLoading: isSellLoading } = Query.Stock.useSellStock();

  const 보유주식 = useMemo(() => {
    return (
      user?.stockStorages
        .filter(({ stockCountCurrent }) => stockCountCurrent > 0)
        .map(({ companyName, stockCountCurrent }) => ({
          company: companyName,
          count: stockCountCurrent,
        })) ?? []
    );
  }, [user?.stockStorages]);

  const currentStockStorage = useMemo(
    () => user?.stockStorages.find(({ companyName }) => companyName === selectedCompany),
    [selectedCompany, user?.stockStorages],
  );

  const averagePurchasePrice = useMemo(
    () =>
      (currentStockStorage?.stockCountHistory.reduce(
        (acc, count, currentIdx) => {
          if (Math.min(timeIdx ?? 0, StockConfig.MAX_STOCK_IDX) < currentIdx) {
            return acc;
          }

          const newCount = acc.count + count;

          if (newCount === 0) {
            return {
              count: 0,
              price: 0,
            };
          }

          return {
            count: newCount,
            price: acc.price + count * (stock?.companies[selectedCompany][currentIdx]?.가격 ?? 0),
          };
        },
        { count: 0, price: 0 },
      ).price ?? 0) / (currentStockStorage?.stockCountCurrent ?? 1),
    [
      currentStockStorage?.stockCountCurrent,
      currentStockStorage?.stockCountHistory,
      selectedCompany,
      stock?.companies,
      timeIdx,
    ],
  );

  const stockProfitRate = useMemo(
    () =>
      selectedCompany && 보유주식.find(({ company }) => company === selectedCompany)
        ? calculateProfitRate(companiesPrice[selectedCompany], averagePurchasePrice)
        : null,
    [averagePurchasePrice, companiesPrice, selectedCompany, 보유주식],
  );

  const chartPriceData = useMemo(
    () => (selectedCompany ? priceData[selectedCompany].slice(0, (timeIdx ?? 0) + 1) : [100000]),
    [priceData, selectedCompany, timeIdx],
  );

  if (!stock || !userId || !user) {
    return <>불러오는 중</>;
  }

  const onClickBuy = (company: string) => {
    buyStock({ amount: 1, company, round: stock.round, stockId, unitPrice: companiesPrice[company], userId });
    // .then(() => {
    //   messageApi.destroy();
    //   messageApi.open({
    //     content: '주식을 구매하였습니다.',
    //     duration: 2,
    //     type: 'success',
    //   });
    // })
    // .catch((reason: Error) => {
    //   messageApi.destroy();
    //   messageApi.open({
    //     content: `${reason.message}`,
    //     duration: 2,
    //     type: 'error',
    //   });
    // });
  };

  const onClickSell = (company: string, amount = 1) => {
    sellStock({ amount, company, round: stock.round, stockId, unitPrice: companiesPrice[company], userId });
    // .then(() => {
    //   messageApi.destroy();
    //   messageApi.open({
    //     content: `주식을 ${amount > 1 ? `${amount}주 ` : ''}판매하였습니다.`,
    //     duration: 2,
    //     type: 'success',
    //   });
    // })
    // .catch((reason: Error) => {
    //   messageApi.destroy();
    //   messageApi.open({
    //     content: `${reason.message}`,
    //     duration: 2,
    //     type: 'error',
    //   });
    // });
  };

  const isLoading = isBuyLoading || isFreezed || isSellLoading;
  const isDisabled = timeIdx === undefined || timeIdx >= StockConfig.MAX_STOCK_IDX || !stock.isTransaction || isLoading;

  const remainingStock = stock.remainingStocks[selectedCompany];
  const isBuyable = user.money >= companiesPrice[selectedCompany];
  const isRemainingStock = Boolean(remainingStock);
  const isCanBuy = isBuyable && isRemainingStock;

  return (
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
        subtitle={`보유 주식: ${getStockStorage(selectedCompany)?.stockCountCurrent ?? 0}`}
        subTitleColor={
          isStockOverLimit(
            userCount?.count ?? Number.NEGATIVE_INFINITY,
            보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
            1,
          ) || !isRemainingStock
            ? 'red'
            : '#d1d5db'
        }
        value={selectedCompany ? companiesPrice[selectedCompany] : 0}
        valueFormatted={`${selectedCompany ? companiesPrice[selectedCompany].toLocaleString() : 0}원`}
        valueColor={isBuyable ? 'white' : 'red'}
        badge={renderProfitBadge(stockProfitRate)}
        src={getAnimalImageSource(selectedCompany)}
        width={50}
      />
      <MessageBalloon messages={stockMessages} />
      <StockLineChart
        company={selectedCompany}
        priceData={chartPriceData}
        fluctuationsInterval={stock.fluctuationsInterval}
        averagePurchasePrice={averagePurchasePrice}
      />
      <ButtonGroup
        buttons={[
          {
            backgroundColor: '#007aff',
            disabled:
              isDisabled ||
              !isCanBuy ||
              isStockOverLimit(
                userCount?.count ?? Number.NEGATIVE_INFINITY,
                보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
                1,
              ),
            flex: 1,
            onClick: () => onClickBuy(selectedCompany),
            text: '사기',
          },
          {
            backgroundColor: '#f63c6b',
            disabled: isDisabled || !보유주식.find(({ company }) => company === selectedCompany)?.count,
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
            disabled: isDisabled || !보유주식.find(({ company }) => company === selectedCompany)?.count,
            onClick: () =>
              onClickSell(selectedCompany, 보유주식.find(({ company }) => company === selectedCompany)?.count),
            text: '모두 팔기',
          },
        ]}
        padding="0 16px 12px 16px"
      />
    </Drawer>
  );
};

export default StockDrawer;
