import { Drawer } from 'antd';
import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useAtomValue } from 'jotai';
import { objectEntries } from '@toss/utils';
import { isStockOverLimit } from 'shared~config/dist/stock';
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
  averagePurchasePrice: number;
  isDisabled: boolean;

  stockId: string;
  onClickBuy: (company: string) => void;
  onClickSell: (company: string, amount?: number) => void;
}

const StockDrawer = ({
  drawerOpen,
  handleCloseDrawer,
  selectedCompany,
  stockMessages,
  priceData,
  averagePurchasePrice,
  isDisabled,
  stockId,
  onClickBuy,
  onClickSell,
}: Props) => {
  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: user } = Query.Stock.useUserFindOne(stockId, userId);
  const { data: stock, companiesPrice, timeIdx } = Query.Stock.useQueryStock(stockId);
  const { data: userCount } = Query.Stock.useUserCount({ stockId });

  const 보유주식 = useMemo(() => {
    return objectEntries(user?.inventory ?? {})
      .filter(([, count]) => count > 0)
      .map(([company, count]) => ({
        company,
        count,
      }));
  }, [user?.inventory]);

  const stockProfitRate =
    selectedCompany && 보유주식.find(({ company }) => company === selectedCompany)
      ? calculateProfitRate(companiesPrice[selectedCompany], averagePurchasePrice)
      : null;

  if (!stock || !userId || !user) {
    return <>불러오는 중</>;
  }

  const isCanBuy = user.money >= companiesPrice[selectedCompany];

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
        subtitle={`보유 주식: ${보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0}`}
        value={selectedCompany ? companiesPrice[selectedCompany] : 0}
        valueFormatted={`${selectedCompany ? companiesPrice[selectedCompany].toLocaleString() : 0}원`}
        badge={renderProfitBadge(stockProfitRate)}
        src={getAnimalImageSource(selectedCompany)}
        width={50}
      />
      <MessageBalloon messages={stockMessages} />
      <StockLineChart
        company={selectedCompany}
        priceData={selectedCompany ? priceData[selectedCompany].slice(0, (timeIdx ?? 0) + 1) : [100000]}
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
            disabled: isDisabled || !user.inventory[selectedCompany],
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
            disabled: isDisabled || !user.inventory[selectedCompany],
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
