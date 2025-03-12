import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import { Query } from '../..';

interface Props {
  stockId: string;
  /**
   * undefined 이면 쿼리를 불러오지 않음
   */
  userId: string | undefined;
}

const useUser = ({ stockId, userId }: Props) => {
  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: user } = Query.Stock.useUserFindOne(stockId, userId);

  if (!user) {
    return { user: undefined };
  }

  const { minutes, seconds } = getDateDistance(dayjs(user.lastActivityTime).toDate(), new Date());
  const isFreezed = minutes === 0 && seconds < (stock?.transactionInterval ?? 5);

  return { isFreezed, user };
};

export default useUser;
