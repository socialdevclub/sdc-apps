import React from 'react';
import { useAtomValue } from 'jotai';
import { commaizeNumber, objectEntries } from '@toss/utils';
import { getDateDistance } from '@toss/date';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import Box from '../../../../../../component-presentation/Box';
import prependZero from '../../../../../../service/prependZero';
import { colorDown, colorUp } from '../../../../../../config/color';

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

  const getProfitRatio = (v: number) => ((v / 1000000) * 100 - 100).toFixed(2);

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

  const [partnerIds, myInfos] = objectEntries(stock.companies).reduce(
    (reducer, [company, companyInfos]) => {
      const [partnerIds, myInfos] = reducer;

      companyInfos.forEach((companyInfo, idx) => {
        if (companyInfos[idx].정보.some((name) => name === userId)) {
          const partner = companyInfos[idx].정보.find((name) => name !== userId);
          if (partner && !partnerIds.some((v) => v === partner)) {
            partnerIds.push(partner);
          }
          myInfos.push({
            company,
            price: companyInfo.가격 - companyInfos[idx - 1].가격,
            timeIdx: idx,
          });
        }
      });

      return reducer;
    },
    [[], []] as [Array<string>, Array<{ company: string; timeIdx: number; price: number }>],
  );

  const partnerNicknames = profiles?.data
    ?.map((v) => {
      if (partnerIds.some((partnerId) => partnerId === v.id)) {
        return v.username;
      }

      return undefined;
    })
    .filter((v) => !!v);

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
      <Box
        title="진행 시간"
        value={`${prependZero(getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).minutes, 2)}:${prependZero(
          getDateDistance(dayjs(stock.startedTime).toDate(), new Date()).seconds,
          2,
        )}`}
      />
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
      <H3>내가 가진 정보</H3>
      {myInfos.map(({ company, price, timeIdx }) => {
        return (
          <Box
            key={`${company}_${timeIdx}`}
            title={`${company}`}
            value={`${price >= 0 ? '▲' : '▼'}${commaizeNumber(Math.abs(price))}`}
            valueColor={price >= 0 ? colorUp : colorDown}
            rightComponent={
              <div
                css={css`
                  font-size: 18px;
                `}
              >
                {prependZero(timeIdx * stock.fluctuationsInterval, 2)}:00
              </div>
            }
          />
        );
      })}
      <br />
      <H3>추천 대화상대</H3>
      <ul>
        {partnerNicknames?.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
      <br />
      {nextRoundPredict && (
        <>
          <H3>변동 예정 정보</H3>
          <Box
            key={`${nextRoundPredict.companyName}`}
            title={nextRoundPredict.companyName}
            value={`?? ${commaizeNumber(nextRoundPredict.priceVariation)}`}
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
