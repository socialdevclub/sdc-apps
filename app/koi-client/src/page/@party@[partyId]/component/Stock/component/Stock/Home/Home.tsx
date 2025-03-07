import { Flex } from 'antd';
import { useAtomValue } from 'jotai';
import { commaizeNumber, objectEntries } from '@toss/utils';
import styled from '@emotion/styled';
import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { css } from '@emotion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserStore } from '../../../../../../../store';
import { Query } from '../../../../../../../hook';
import { MyLevel } from './MyLevel';
import Card from '../../../../../../../component-presentation/Card';
import * as COLOR from '../../../../../../../config/color';
import StartLoan from '../StartLoan';
import prependZero from '../../../../../../../service/prependZero';
import InfoBox from '../../../../../../../component-presentation/InfoBox';
import { colorDown, colorUp } from '../../../../../../../config/color';

const getProfitRatio = (v: number) => ((v / 1000000) * 100 - 100).toFixed(2);

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

const Home = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, refetch } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);
  const { user } = Query.Stock.useUser({ stockId, userId });

  const { allSellPrice, allUserSellPriceDesc } = Query.Stock.useAllSellPrice({ stockId, userId });
  const [gameTime, setGameTime] = useState(getFormattedGameTime(stock?.startedTime));
  const gameTimeRef = useRef(gameTime);

  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = () => {
    const params = new URLSearchParams(location.search);
    params.set('page', '정보');
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

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

  const { futureInfos } = myInfos.reduce(
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

  const allProfitDesc = allUserSellPriceDesc()
    .map(({ userId, allSellPrice }) => {
      const user = users.find((v) => v.userId === userId);
      if (!user) {
        return {
          profit: 0,
          userId,
        };
      }

      return {
        profit: allSellPrice + user.money,
        userId,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  const moneyRatio = getProfitRatio(user.money + allSellPrice);

  return (
    <>
      <Container>
        <MyLevel moneyRatio={moneyRatio} initialMoney={1000000} />
        <Flex gap={12} css={{ width: '100%' }}>
          <Card
            title="잔액"
            value={`₩${commaizeNumber(user.money)}`}
            valueColor={COLOR.pastelGreen}
            rightComponent={
              stock.isVisibleRank ? (
                <>{users.sort((a, b) => b.money - a.money).findIndex((v) => v.userId === userId) + 1}위</>
              ) : (
                <></>
              )
            }
          />
          <Card
            title="주식 가치"
            valueColor={COLOR.pastelViolet}
            value={`₩${commaizeNumber(allSellPrice)}`}
            rightComponent={
              stock.isVisibleRank ? <>{allUserSellPriceDesc().findIndex((v) => v.userId === userId) + 1}위</> : <></>
            }
          />
        </Flex>
        <Card
          title="모두 팔고 난 뒤의 금액"
          value={`₩${commaizeNumber(user.money + allSellPrice)}`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
        />
        <Card
          title="모두 팔고 난 뒤의 순이익"
          value={`${moneyRatio}%`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
        />
      </Container>
      <Wrapper>
        <TitleWrapper>
          <LeftSection>
            <H3>내 예측 정보</H3>
            <H6Wrapper>
              <H6>총 {myInfos.length}개 보유</H6>
            </H6Wrapper>
          </LeftSection>
          <H5 onClick={handlePageChange}>전체보기 &gt;</H5>
        </TitleWrapper>
        <H4>현재 시각 이후의 정보 최대 2개가 표시됩니다</H4>
        <FutuerInfoWrapper>
          {futureInfos.slice(0, 2).map(({ company, price, timeIdx }) => {
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
        </FutuerInfoWrapper>
      </Wrapper>
      <StickyBottom>
        <StartLoan stockId={stockId} />
      </StickyBottom>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  padding: 12px 0 20px 0;
  flex: 1 1 0;
`;

const Wrapper = styled.div`
  width: 100%;
`;

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const H3 = styled.h3`
  font-size: 16px;
  margin: 0;
`;

const H5 = styled.h5`
  font-size: 10px;
  color: #9ca3af;
  margin: 0;
  padding: 8px 8px;
  cursor: pointer;
`;

const H4 = styled.h4`
  font-size: 10px;
`;

const H6 = styled.h6`
  font-size: 12px;
  margin: 0;
  color: #c084fc;
`;

const H6Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 8px;
  background-color: rgba(192, 132, 252, 0.2);
  border-radius: 20px;
`;

const FutuerInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// TODO: 만약 영역이 겹치는 이슈가 발생 시 수정
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

export default Home;
