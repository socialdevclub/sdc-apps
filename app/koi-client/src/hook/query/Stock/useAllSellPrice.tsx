import { objectEntries } from '@toss/utils';
import { useCallback } from 'react';
import { Query } from '../..';

interface Props {
  stockId: string;
  /**
   * @default ''
   */
  userId?: string;
}

/**
 * 모두 팔았을 때 가격
 */
const useAllSellPrice = ({ stockId, userId = '' }: Props) => {
  const { companiesPrice } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);

  const allSellPriceCallback = useCallback(
    (userId: string) => {
      const selectedUser = users.find((selUser) => selUser.userId === userId);

      if (!selectedUser || !companiesPrice) {
        return 0;
      }

      return objectEntries(selectedUser.inventory).reduce((price, [company, count]) => {
        return price + companiesPrice[company] * count;
      }, 0);
    },
    [companiesPrice, users],
  );

  const allSellPrice = allSellPriceCallback(userId);

  const allUserSellPriceDesc = useCallback(() => {
    const AllSellPriceByUser = [] as Array<{ userId: string; allSellPrice: number }>;
    for (const user of users) {
      AllSellPriceByUser.push({
        allSellPrice: allSellPriceCallback(user.userId),
        userId: user.userId,
      });
    }
    return AllSellPriceByUser.sort((a, b) => b.allSellPrice - a.allSellPrice);
  }, [allSellPriceCallback, users]);

  return { allSellPrice, allUserSellPriceDesc };
};

export default useAllSellPrice;
