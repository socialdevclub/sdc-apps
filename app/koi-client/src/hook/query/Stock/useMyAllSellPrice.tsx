import { useMemo } from 'react';
import { objectEntries } from '@toss/utils';
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

    return objectEntries(user.companyStorage).reduce((acc, [company, { count }]) => {
      return acc + companiesPrice[company] * count;
    }, 0);
  }, [companiesPrice, user]);

  return { myAllSellPrice };
};

export default useMyAllSellPrice;
