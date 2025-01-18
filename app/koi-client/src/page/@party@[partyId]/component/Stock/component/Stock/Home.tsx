import { Flex } from 'antd';
import { useAtomValue } from 'jotai';
import { commaizeNumber, objectEntries } from '@toss/utils';
import { getDateDistance } from '@toss/date';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import Box from '../../../../../../component-presentation/Box';
import DrawStockInfo from './DrawInfo';
import MyInfosContent from './MyInfosContent';
import RunningTimeDisplay from './RunningTimeDisplay';
import prependZero from '../../../../../../service/prependZero';

const getProfitRatio = (v: number) => ((v / 1000000) * 100 - 100).toFixed(2);

const DEFAULT_FLUCTUATION_INTERVAL = 5;
const REMAINING_STOCK_THRESHOLD = 0.9;
const STOCK_PER_USER = 3;
const TOTAL_ROUND_COUNT = 10;

const getCurrentRoundIndex = (startTime?: string, interval: number = DEFAULT_FLUCTUATION_INTERVAL) => {
  if (startTime === undefined) return -1;
  const distance = getDateDistance(dayjs(startTime).toDate(), new Date());
  return Math.floor(distance.minutes / interval);
};

const getLowSalesCompanies = (
  remainingStocks: Record<string, number>,
  userCount: number,
  stockPerUser = STOCK_PER_USER,
) => {
  const maxQuantity = (userCount ?? 1) * stockPerUser;
  return objectEntries(remainingStocks)
    .filter(([, remaining]) => remaining > maxQuantity * REMAINING_STOCK_THRESHOLD)
    .map(([company]) => company);
};

const generateNumberFromString = (str: string): number => {
  return str.split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);
};

interface Props {
  stockId: string;
}

const Home = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));
  const { user } = Query.Stock.useUser({ stockId, userId });

  const { allSellPrice, allUserSellPriceDesc } = Query.Stock.useAllSellPrice({ stockId, userId });

  if (!user || !stock) {
    return <div>불러오는 중.</div>;
  }

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

  const roundIndex = getCurrentRoundIndex(stock.startedTime, stock.fluctuationsInterval);
  const lowSalesCompanies = getLowSalesCompanies(stock.remainingStocks, profiles?.data?.length ?? 1);

  const getPredictedStockInfo = () => {
    if (roundIndex < 0 || roundIndex >= TOTAL_ROUND_COUNT - 1 || lowSalesCompanies.length === 0) {
      return null;
    }

    const randomIndex = generateNumberFromString(`${stockId}-${roundIndex}-${userId}`) % lowSalesCompanies.length;
    const companyName = lowSalesCompanies[randomIndex];

    return {
      companyName,
      predictTime: prependZero((roundIndex + 1) * stock.fluctuationsInterval, 2),
      priceVariation: Math.abs(
        (stock.companies?.[companyName]?.[roundIndex + 1]?.가격 ?? 0) -
          (stock.companies?.[companyName]?.[roundIndex]?.가격 ?? 0),
      ),
    };
  };

  const nextRoundPredict = getPredictedStockInfo();

  return (
    <>
      <H3>홈</H3>
      <RunningTimeDisplay startTime={stock.startedTime} />
      <Box
        title="잔액"
        value={`${commaizeNumber(user.money)}원`}
        rightComponent={
          stock.isVisibleRank ? (
            <>{users.sort((a, b) => b.money - a.money).findIndex((v) => v.userId === userId) + 1}위</>
          ) : (
            <></>
          )
        }
      />
      <Box
        title="주식 가치"
        value={`${commaizeNumber(allSellPrice)}원`}
        rightComponent={
          stock.isVisibleRank ? <>{allUserSellPriceDesc().findIndex((v) => v.userId === userId) + 1}위</> : <></>
        }
      />
      <Box
        title="모두 팔고 난 뒤의 금액"
        value={`${commaizeNumber(user.money + allSellPrice)}원`}
        rightComponent={stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>}
      />
      <Box
        title="모두 팔고 난 뒤의 순이익"
        value={`${getProfitRatio(user.money + allSellPrice)}%`}
        rightComponent={stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>}
      />
      <br />
      <Flex align="center" justify="space-between" gap={4} css={{ width: '100%' }}>
        <H3>내가 가진 정보</H3>
        <DrawStockInfo stockId={stockId} />
      </Flex>
      <MyInfosContent myInfos={myInfos} fluctuationsInterval={stock.fluctuationsInterval} />
      <br />
      {nextRoundPredict && (
        <>
          <H3>변동 예정 정보</H3>
          <Box
            key={`${nextRoundPredict.companyName}`}
            title={nextRoundPredict.companyName}
            value={`${nextRoundPredict.priceVariation / 100}억 규모 투자 협상중`}
            rightComponent={
              <div
                css={css`
                  font-size: 18px;
                `}
              >
                {nextRoundPredict.predictTime}:00
              </div>
            }
          />
        </>
      )}
      <br />
      <br />
    </>
  );
};

const H3 = styled.h3`
  text-shadow: 2px 2px #8461f8;
`;

export default Home;
