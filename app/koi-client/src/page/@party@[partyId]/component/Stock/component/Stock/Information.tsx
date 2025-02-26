import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { getDateDistance } from '@toss/date';
import { commaizeNumber, objectEntries } from '@toss/utils';

import InfoBox from '../../../../../../component-presentation/InfoBox';
import { colorDown, colorUp } from '../../../../../../config/color';
import { Query } from '../../../../../../hook';
import prependZero from '../../../../../../service/prependZero';
import { UserStore } from '../../../../../../store';

interface Props {
  stockId: string;
}

const Information = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;
  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { user } = Query.Stock.useUser({ stockId, userId });

  if (!user || !stock) {
    return <div>불러오는 중.</div>;
  }

  const gameTime = `${prependZero(
    getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).minutes,
    2,
  )}:${prependZero(getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).seconds, 2)}`;

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

  const gameTimeInSeconds = parseInt(gameTime.split(':')[0], 10) * 60 + parseInt(gameTime.split(':')[1], 10);

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

  const gameTimeInMinutes = Math.ceil(parseInt(gameTime.split(':')[0], 10) / 5) * 5;

  return (
    <Container>
      <TitleWrapper>
        <H1>앞으로의 정보</H1>
        <H2>{futureInfos.length}개 보유</H2>
      </TitleWrapper>
      {futureInfos.map(({ company, price, timeIdx }) => {
        const infoTimeInMinutes = timeIdx * stock.fluctuationsInterval;
        const remainingTime = Math.ceil((infoTimeInMinutes - gameTimeInMinutes) / 5) * 5;

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
                {remainingTime < 3 ? `🚨 임박` : `${Math.abs(remainingTime)}분 후`}
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
          console.log('pastTime', pastTime);
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
                  {pastTime < 5 ? '방금 전' : `${pastTime}분 전`}
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
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
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
  opacity: 0.5;
  pointer-events: none;
`;

export default Information;
