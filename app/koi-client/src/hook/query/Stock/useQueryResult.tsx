import { useCallback } from 'react';
import { Query } from '../..';

const useQueryResult = (stockId: string | undefined) => {
  const { data: users } = Query.Stock.useUserList(stockId);

  const getRound0Avg = useCallback(
    (userId: string) => {
      return users?.find((v) => v.userId === userId)?.resultByRound[0] ?? 0;
    },
    [users],
  );

  const getRound12Avg = useCallback(
    (userId?: string) => {
      const resultByRound = users
        ?.find((v) => v.userId === userId)
        ?.resultByRound.slice(1)
        .filter((money) => typeof money === 'number');

      if (!resultByRound) {
        return 0;
      }

      return resultByRound.reduce((acc, money) => acc + money, 0) / resultByRound.length;
    },
    [users],
  );

  return { getRound0Avg, getRound12Avg };
};

export default useQueryResult;
