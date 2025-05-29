import { Drawer } from 'antd';
import { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useAtomValue } from 'jotai';
import { isStockOverLimit } from 'shared~config/dist/stock';
import { MessageInstance } from 'antd/es/message/interface';
import { StockConfig } from 'shared~config';
import { MEDIA_QUERY } from '../../../../../../config/common';
import InfoHeader from '../../../../../../component-presentation/InfoHeader';
import { calculateProfitRate, getAnimalImageSource, renderStockChangesInfo } from '../../../../../../utils/stock';
import MessageBalloon from '../../../../../../component-presentation/MessageBalloon';
import StockLineChart from '../../../../../../component-presentation/StockLineChart';
import ButtonGroup from '../../../../../../component-presentation/ButtonGroup';
import { Query } from '../../../../../../hook';
import { UserStore } from '../../../../../../store';
import StockBuyingNotification from './StockBuyingNotification';
import { useTradeStock } from '../../../../hook/useTradeStock';

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

  const {
    refetch: refetchUser,
    isFreezed,
    user,
    getStockStorage,
  } = Query.Stock.useUser({
    stockId,
    userId,
    userRefetchInterval: 500,
  });
  const {
    data: stock,
    companiesPrice,
    timeIdx,
  } = Query.Stock.useQueryStock(stockId, {
    refetchInterval: Number.POSITIVE_INFINITY,
  });
  const { data: userCount } = Query.Stock.useUserCount({ stockId });

  const { isBuyLoading, isSellLoading, onClickBuy, onClickSell } = useTradeStock({
    messageApi,
  });

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
    () => currentStockStorage?.stockAveragePrice ?? 0,
    [currentStockStorage?.stockAveragePrice],
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

  const isLoading = isBuyLoading || isFreezed || isSellLoading;
  const isDisabled = timeIdx === undefined || timeIdx >= StockConfig.MAX_STOCK_IDX || !stock.isTransaction || isLoading;

  // Todo:: 선택한 회사가 없을 때도 계속 계산하고 있으므로 컴포넌트를 분리하는게 좋을 것 같습니다.
  // 또한 변수가 많아 가시성이 떨어짐
  const remainingStock = stock.remainingStocks[selectedCompany]; // 선택한 주식의 남은 개수
  const maxBuyableCount = Math.floor(user.money / companiesPrice[selectedCompany]); // 내가 가진 돈으로 선택한 주식을 얼마나 살 수 있는가
  const isBuyable = user.money >= companiesPrice[selectedCompany];
  const isRemainingStock = Boolean(remainingStock);
  const isCanBuy = isBuyable && isRemainingStock;

  // 주식 구매 한도 계산
  const currentStockCount = getStockStorage(selectedCompany)?.stockCountCurrent ?? 0; // 내가 보유한 해당 주식의 개수
  const playerCount = userCount?.count ?? 0; // 플레이어의 수
  const maxStockLimitByPlayer = Math.max(0, playerCount - currentStockCount); // 플레이어 수 제한에 따른 최대 구매 가능 개수

  // 최종 구매 가능 개수 계산 (돈, 남은 주식, 플레이어 수 제한 고려)
  const maxBuyableCountWithLimit = Math.min(maxBuyableCount, remainingStock ?? 0, maxStockLimitByPlayer);

  // TODO :: timeIdx (현재 라운드 정보) 타입가드 엄격한 처리 필요 (임시로 땜빵 타입가드 설정함)
  // if (!timeIdx) {
  //   return <div>로딩중입니다...</div>;
  // }

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
      {selectedCompany && (
        <InfoHeader
          title={selectedCompany.slice(0, 4)}
          subtitle={`보유 주식: ${currentStockCount}`}
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
          badge={renderStockChangesInfo(selectedCompany, stock, companiesPrice, timeIdx ?? 0)}
          src={getAnimalImageSource(selectedCompany)}
          width={50}
        />
      )}

      <MessageBalloon messages={stockMessages} />
      <StockLineChart
        company={selectedCompany}
        priceData={chartPriceData}
        fluctuationsInterval={stock.fluctuationsInterval}
        averagePurchasePrice={averagePurchasePrice}
      />
      <StockBuyingNotification
        stockProfitRate={stockProfitRate}
        remainingStock={remainingStock}
        maxBuyableCountWithLimit={maxBuyableCountWithLimit}
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
            onClick: () =>
              onClickBuy({
                amount: 1,
                callback: () => refetchUser(),
                company: selectedCompany,
                round: stock.round,
                stockId,
                unitPrice: companiesPrice[selectedCompany],
                userId,
              }),
            text: '사기',
          },
          {
            backgroundColor: '#f63c6b',
            disabled: isDisabled || !보유주식.find(({ company }) => company === selectedCompany)?.count,
            flex: 1,
            onClick: () =>
              onClickSell({
                amount: 1,
                callback: () => refetchUser(),
                company: selectedCompany,
                round: stock.round,
                stockId,
                unitPrice: companiesPrice[selectedCompany],
                userId,
              }),
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
              onClickSell({
                amount: 보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
                callback: () => refetchUser(),
                company: selectedCompany,
                round: stock.round,
                stockId,
                unitPrice: companiesPrice[selectedCompany],
                userId,
              }),
            text: '모두 팔기',
          },
        ]}
        padding="0 16px 12px 16px"
      />
    </Drawer>
  );
};

export default StockDrawer;
