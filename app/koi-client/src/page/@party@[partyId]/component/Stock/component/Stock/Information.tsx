import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { getDateDistance } from '@toss/date';
import { commaizeNumber, objectEntries } from '@toss/utils';

import { useEffect, useRef, useState } from 'react';
import InfoBox from '../../../../../../component-presentation/InfoBox';
import { colorDown, colorUp } from '../../../../../../config/color';
import { Query } from '../../../../../../hook';
import prependZero from '../../../../../../service/prependZero';
import { UserStore } from '../../../../../../store';
import DrawStockInfo from './DrawInfo';

interface Props {
  stockId: string;
}

const getFormattedGameTime = (startTime?: string) => {
  if (!startTime) return '00:00';

  return `${prependZero(getDateDistance(dayjs(startTime).toDate(), new Date()).minutes, 2)}:${prependZero(
    getDateDistance(dayjs(startTime).toDate(), new Date()).seconds,
    2,
  )}`;
};

const Information = ({ stockId }: Props) => {
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

  const myInfos = objectEntries(stock.companies).reduce((myInfos, [company, companyInfos]) => {
    companyInfos.forEach((companyInfo, idx) => {
      if (companyInfo.정보.some((name) => name === userId)) {
        myInfos.push({
          company,
          price: idx > 0 ? companyInfo.가격 - companyInfos[idx - 1].가격 : 0,
          timeIdx: idx,
        });
      }
    });
    return myInfos;
  }, [] as Array<{ company: string; timeIdx: number; price: number }>);

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
                {remainingTime <= 1 ? `🚨 임박` : `${remainingTime}분 후`}
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

      <DimContainer>
        {pastInfos.map(({ company, price, timeIdx }) => {
          const pastTime = gameTimeInMinutes - timeIdx * stock.fluctuationsInterval;
          return (
            <InfoBox
              key={`${company}_${timeIdx}`}
              title={company}
              value={`${price >= 0 ? '▲' : '▼'}${commaizeNumber(Math.abs(price))}`}
              valueColor={price >= 0 ? colorUp : colorDown}
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
      </DimContainer>
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

const DimContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0.5;
  pointer-events: none;
`;

const StickyBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #252836;
  border-top: 1px solid #374151;
  padding: 20px;
  box-sizing: border-box;
`;

export default Information;
