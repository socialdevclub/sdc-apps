import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import { useCallback } from 'react';
import { Query } from '../..';

interface Props {
  stockId: string;
  /**
   * undefined 이면 쿼리를 불러오지 않음
   */
  userId: string | undefined;
  stockRefetchInterval?: number;
  userRefetchInterval?: number;
}

const useUser = ({ stockId, userId, userRefetchInterval, stockRefetchInterval }: Props) => {
  const { data: stock, refetch: refetchStock } = Query.Stock.useQueryStock(stockId, {
    refetchInterval: stockRefetchInterval,
  });
  const { data: user, refetch: refetchUser } = Query.Stock.useUserFindOne(stockId, userId, {
    refetchInterval: userRefetchInterval,
  });

  const refetch = () => {
    refetchStock();
    refetchUser();
  };

  const getStockStorage = useCallback(
    (company: string) => {
      return user?.stockStorages.find((storage) => storage.companyName === company);
    },
    [user?.stockStorages],
  );

  if (!user) {
    return { getStockStorage, refetch, user: undefined };
  }

  const { minutes, seconds } = getDateDistance(dayjs(user.lastActivityTime).toDate(), new Date());
  const isFreezed = minutes === 0 && seconds < (stock?.transactionInterval ?? 5);

  return {
    getStockStorage,
    isFreezed,
    refetch,
    user,
  };
};

export default useUser;
