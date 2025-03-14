import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
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

  if (!user) {
    return { refetch, user: undefined };
  }

  const { minutes, seconds } = getDateDistance(dayjs(user.lastActivityTime).toDate(), new Date());
  const isFreezed = minutes === 0 && seconds < (stock?.transactionInterval ?? 5);

  return {
    isFreezed,
    refetch,
    user,
  };
};

export default useUser;
