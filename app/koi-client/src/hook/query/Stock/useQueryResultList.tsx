import { useMemo } from 'react';
import { Query } from '../..';

const useQueryResultList = (stockId: string | undefined) => {
  const { data: users } = Query.Stock.useUserList(stockId);

  const resultList = useMemo(() => {
    const list: {
      money: number;
      round: number;
      userId: string;
    }[] = [];

    for (const user of users ?? []) {
      user.resultByRound.forEach((money, round) => {
        list.push({
          money,
          round,
          userId: user.userId,
        });
      });
    }

    return list;
  }, [users]);

  return { data: resultList };
};

export default useQueryResultList;
