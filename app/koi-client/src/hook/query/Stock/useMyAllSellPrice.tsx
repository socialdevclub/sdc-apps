import { objectEntries } from '@toss/utils';
import { useMemo } from 'react';
import { Query } from '../..';

interface Props {
  stockId: string;
  userId: string | undefined;
}

/**
 * 모두 팔았을 때 가격
 */
const useMyAllSellPrice = ({ stockId, userId }: Props) => {
  const { companiesPrice } = Query.Stock.useQueryStock(stockId);
  const { data: user } = Query.Stock.useUserFindOne(stockId, userId);

  const myAllSellPrice = useMemo(() => {
    if (!user || !companiesPrice) {
      return 0;
    }

    return objectEntries(user.inventory).reduce((price, [company, count]) => {
      return price + companiesPrice[company] * count;
    }, 0);
  }, [companiesPrice, user]);

  return { myAllSellPrice };
};

export default useMyAllSellPrice;
