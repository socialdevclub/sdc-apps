import { useAtomValue } from 'jotai';
import { objectEntries } from '@toss/utils';
import { Query } from '../../../../../../../../hook';
import { UserStore } from '../../../../../../../../store';
import useTimeRaceCheck from '../../../../../../../../hook/useTimeRaceCheck';

export type UseStockInfo = ReturnType<typeof useStockInfo>;

export const useStockInfo = (stockId: string) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, refetch, timeIdx } = Query.Stock.useQueryStock(stockId);
  const { user } = Query.Stock.useUser({ stockId, userId });
  const { allUserSellPriceDesc } = Query.Stock.useAllUserSellPriceDesc(stockId);
  const { gameTime } = useTimeRaceCheck({ refetch, stock });

  const isEnabledUserList = stock?.isVisibleRank ?? false;
  const { data: users } = Query.Stock.useUserList(stockId, { enabled: isEnabledUserList });

  const gameTimeInSeconds = gameTime
    ? parseInt(gameTime.split(':')[0], 10) * 60 + parseInt(gameTime.split(':')[1], 10)
    : 0;
  const gameTimeInMinutes = Math.ceil(parseInt(gameTime.split(':')[0], 10));

  // 내 예측 정보 계산
  const myInfos = stock
    ? objectEntries(stock.companies).reduce((myInfos, [company, companyInfos]) => {
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
      }, [] as Array<{ company: string; timeIdx: number; price: number }>)
    : [];

  // 현재 시간 이후의 정보만 필터링
  const futureInfos = myInfos
    .filter((info) => {
      const infoTimeInSeconds = (stock?.fluctuationsInterval && info.timeIdx * 60 * stock.fluctuationsInterval) ?? 0;
      return infoTimeInSeconds >= gameTimeInSeconds;
    })
    .sort((a, b) => a.timeIdx - b.timeIdx);

  // 모든 유저의 수익 계산
  const allProfitDesc =
    users && allUserSellPriceDesc
      ? allUserSellPriceDesc()
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
          .sort((a, b) => b.profit - a.profit)
      : [];

  return {
    allProfitDesc,
    allUserSellPriceDesc,
    futureInfos,
    gameTime,
    gameTimeInMinutes,
    gameTimeInSeconds,
    myInfos,
    refetch,
    stock,
    timeIdx,
    user,
    userId,
    users,
  };
};
