import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import { Query } from '../..';

interface Props {
  stockId: string;
  /**
   * undefined 이면 쿼리를 불러오지 않음
   */
  userId: string | undefined;
  userRefetchInterval?: number;
}

const useUser = ({ stockId, userId, userRefetchInterval }: Props) => {
  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: user } = Query.Stock.useUserFindOne(stockId, userId, { refetchInterval: userRefetchInterval });

  if (!user) {
    return { user: undefined };
  }

  const { minutes, seconds } = getDateDistance(dayjs(user.lastActivityTime).toDate(), new Date());
  const isFreezed = minutes === 0 && seconds < (stock?.transactionInterval ?? 5);

  return { isFreezed, user };
};

export default useUser;
