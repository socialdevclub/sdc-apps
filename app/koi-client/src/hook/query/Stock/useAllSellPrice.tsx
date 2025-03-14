import { objectEntries } from '@toss/utils';
import { useCallback } from 'react';
import { Query } from '../..';

interface Props {
  stockId: string;
}

interface Options {
  enabled?: boolean;
}

/**
 * 모두 팔았을 때 가격
 */
const useAllSellPrice = ({ stockId }: Props, options?: Options) => {
  const enabled = options?.enabled ?? false;

  const { companiesPrice } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId, { enabled });

  const allSellPriceCallback = useCallback(
    (userId: string) => {
      const selectedUser = users?.find((selUser) => selUser.userId === userId);

      if (!selectedUser || !companiesPrice) {
        return 0;
      }

      return objectEntries(selectedUser.inventory).reduce((price, [company, count]) => {
        return price + companiesPrice[company] * count;
      }, 0);
    },
    [companiesPrice, users],
  );

  return { allSellPriceCallback };
};

export default useAllSellPrice;
