import { useCallback } from 'react';
import { Query } from '../..';

const useAllUserSellPriceDesc = (stockId: string) => {
  const { data: stock } = Query.Stock.useQueryStock(stockId);

  const enabled = stock?.isVisibleRank ?? false;
  const { allSellPriceCallback } = Query.Stock.useAllSellPrice({ stockId }, { enabled });
  const { data: users } = Query.Stock.useUserList(stockId, { enabled });

  const allUserSellPriceDesc = useCallback(() => {
    if (!enabled) {
      return [];
    }

    const AllSellPriceByUser = [] as Array<{ userId: string; allSellPrice: number }>;
    for (const user of users ?? []) {
      AllSellPriceByUser.push({
        allSellPrice: allSellPriceCallback(user.userId),
        userId: user.userId,
      });
    }
    return AllSellPriceByUser.sort((a, b) => b.allSellPrice - a.allSellPrice);
  }, [allSellPriceCallback, enabled, users]);

  return { allUserSellPriceDesc, enabled };
};

export default useAllUserSellPriceDesc;
