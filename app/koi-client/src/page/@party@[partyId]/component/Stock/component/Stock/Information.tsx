import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { commaizeNumber, objectEntries } from '@toss/utils';
import { useAtomValue } from 'jotai';

import { Drawer, message } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import ButtonGroup from '../../../../../../component-presentation/ButtonGroup';
import InfoBox from '../../../../../../component-presentation/InfoBox';
import InfoHeader from '../../../../../../component-presentation/InfoHeader';
import MessageBalloon from '../../../../../../component-presentation/MessageBalloon';
import StockLineChart from '../../../../../../component-presentation/StockLineChart';
import { colorDown, colorUp } from '../../../../../../config/color';
import { MEDIA_QUERY } from '../../../../../../config/common';
import { Query } from '../../../../../../hook';
import prependZero from '../../../../../../service/prependZero';
import { UserStore } from '../../../../../../store';
import {
  calculateAveragePurchasePrice,
  calculateProfitRate,
  getFormattedGameTime,
  getStockMessages,
  renderProfitBadge,
} from '../../../../../../utils/stock';
import DrawStockInfo from './DrawInfo';

interface Props {
  stockId: string;
}

const Information = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, companiesPrice, timeIdx } = Query.Stock.useQueryStock(stockId);
  const round = stock?.round;
  const { data: logs } = Query.Stock.useQueryLog({ round, stockId, userId });
  const { isFreezed, user } = Query.Stock.useUser({ stockId, userId });

  const { mutateAsync: buyStock, isLoading: isBuyLoading } = Query.Stock.useBuyStock();
  const { mutateAsync: sellStock, isLoading: isSellLoading } = Query.Stock.useSellStock();

  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });

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

  // const 미보유주식 = useMemo(() => {
  //   return objectValues(COMPANY_NAMES).filter((company) => !보유주식.some(({ company: c }) => c === company));
  // }, [보유주식]);

  if (!stock || !userId || !user) {
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

  const averagePurchasePrice = calculateAveragePurchasePrice({
    company: selectedCompany,
    currentQuantity: 보유주식.find(({ company }) => company === selectedCompany)?.count ?? 0,
    logs,
    round,
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
      <InformationItems stockId={stockId} onClick={handleOpenDrawer} myInfos={myInfos} />
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
          src={`/no_bg_animal/${ANIMAL_NAME[selectedCompany.slice(0, 4)]}.webp`}
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

export default Information;

interface InformationItemsProps {
  stockId: string;
  onClick: (company: string) => void;
  myInfos: Array<{ company: string; timeIdx: number; price: number }>;
}

const InformationItems = ({ stockId, onClick, myInfos }: InformationItemsProps) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;
  const { data: stock, refetch } = Query.Stock.useQueryStock(stockId);
  const { user } = Query.Stock.useUser({ stockId, userId });
  const [gameTime, setGameTime] = useState(getFormattedGameTime(stock?.startedTime));
  const gameTimeRef = useRef(gameTime);

  useEffect(() => {
    if (!stock?.startedTime) return () => {};

    const interval = setInterval(() => {
      const newGameTime = getFormattedGameTime(stock.startedTime);

      if (newGameTime !== gameTimeRef.current) {
        const newGameMinute = parseInt(newGameTime.split(':')[0], 10);
        const lastGameMinute = parseInt(gameTimeRef.current.split(':')[0], 10);

        gameTimeRef.current = newGameTime;
        setGameTime(newGameTime);

        if (newGameMinute !== lastGameMinute) {
          refetch();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stock?.startedTime, refetch]);

  if (!user || !stock) {
    return <div>불러오는 중.</div>;
  }

  const gameTimeInSeconds = parseInt(gameTime.split(':')[0], 10) * 60 + parseInt(gameTime.split(':')[1], 10);
  const gameTimeInMinutes = Math.ceil(parseInt(gameTime.split(':')[0], 10));

  const { futureInfos, pastInfos } = myInfos.reduce(
    (acc, info) => {
      const infoTimeInSeconds = stock?.fluctuationsInterval && info.timeIdx * 60 * stock.fluctuationsInterval;

      if (infoTimeInSeconds >= gameTimeInSeconds) {
        let index = acc.futureInfos.findIndex((item) => item.timeIdx > info.timeIdx);
        if (index === -1) index = acc.futureInfos.length;
        acc.futureInfos.splice(index, 0, info);
      } else {
        let index = acc.pastInfos.findIndex((item) => item.timeIdx < info.timeIdx);
        if (index === -1) index = acc.pastInfos.length;
        acc.pastInfos.splice(index, 0, info);
      }

      return acc;
    },
    {
      futureInfos: [] as Array<{ company: string; timeIdx: number; price: number }>,
      pastInfos: [] as Array<{ company: string; timeIdx: number; price: number }>,
    },
  );

  return (
    <Container>
      <TitleWrapper>
        <H1>앞으로의 정보</H1>
        <H2>{futureInfos.length}개 보유</H2>
      </TitleWrapper>
      {futureInfos.map(({ company, price, timeIdx }) => {
        const infoTimeInMinutes = timeIdx * stock.fluctuationsInterval;
        const remainingTime = infoTimeInMinutes - gameTimeInMinutes;

        return (
          <InfoBox
            key={`${company}_${timeIdx}`}
            title={company}
            onClick={() => onClick(company)}
            value={`${price >= 0 ? '▲' : '▼'}${commaizeNumber(Math.abs(price))}`}
            valueColor={price >= 0 ? colorUp : colorDown}
            leftTime={
              <div
                css={css`
                  font-size: 14px;
                  color: #c084fc;
                  min-width: 50px;
                  letter-spacing: 0.5px;
                `}
              >
                {remainingTime <= 1 ? <span style={{ color: '#f96257' }}>🚨 임박</span> : `${remainingTime}분 후`}
              </div>
            }
            changeTime={
              <div
                css={css`
                  font-size: 12px;
                  color: #9ca3af;
                  letter-spacing: 0.5px;
                `}
              >
                {prependZero(timeIdx * stock.fluctuationsInterval, 2)}:00
              </div>
            }
          />
        );
      })}

      <Divider />

      <TitleWrapper>
        <H1>지난 정보</H1>
        <H2>{pastInfos.length}개 보유</H2>
      </TitleWrapper>

      {pastInfos.map(({ company, price, timeIdx }) => {
        const pastTime = gameTimeInMinutes - timeIdx * stock.fluctuationsInterval;
        return (
          <InfoBox
            key={`${company}_${timeIdx}`}
            title={company}
            value={`${price >= 0 ? '▲' : '▼'}${commaizeNumber(Math.abs(price))}`}
            valueColor={price >= 0 ? colorUp : colorDown}
            opacity={0.5}
            onClick={() => onClick(company)}
            leftTime={
              <div
                css={css`
                  font-size: 14px;
                  color: #ffffff;
                  min-width: 50px;
                  letter-spacing: 0.5px;
                `}
              >
                {pastTime <= 1 ? '방금 전' : `${pastTime}분 전`}
              </div>
            }
            changeTime={
              <div
                css={css`
                  font-size: 12px;
                  color: #9ca3af;
                  letter-spacing: 0.5px;
                `}
              >
                {prependZero(timeIdx * stock.fluctuationsInterval, 2)}:00
              </div>
            }
          />
        );
      })}
      <StickyBottom>
        <DrawStockInfo stockId={stockId} />
      </StickyBottom>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 108px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const H1 = styled.div`
  font-size: 16px;
  line-height: 22px;
`;

const H2 = styled.div`
  padding: 2px 8px;
  font-size: 10px;
  line-height: 22px;
  color: #c084fc;
  border-radius: 16px;
  background-color: rgba(192, 132, 252, 0.2);
`;

const Divider = styled.div`
  border-top: 1px solid #374151;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const StickyBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #252836;
  border-top: 1px solid #374151;
  padding: 16px;
  box-sizing: border-box;
`;
