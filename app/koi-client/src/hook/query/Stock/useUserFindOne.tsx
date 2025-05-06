import { getQueryKey } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';
import { Query } from '../..';

type StockId = string | undefined;

interface Options {
  enabled?: boolean;
  refetchInterval?: number;
}

/**
 * @deprecated useQueryStock 사용
 */
const useUserFindOne = (stockId: string | undefined, userId: string | undefined, options?: Options) => {
  const enabled = options?.enabled ?? true;
  const refetchInterval = options?.refetchInterval ?? 1500;

  const { data, refetch } = Query.Stock.useQueryStock({ stockId, userId }, { enabled, refetchInterval });

  if (data && 'statusCode' in data && 'message' in data) {
    return { data: undefined, error: data, refetch };
  }

  return { data: data?.user, refetch };
};
useUserFindOne.queryKey = (stockId: StockId, userId: string | undefined) =>
  getQueryKey({
    hostname: serverApiUrl,
    method: 'GET',
    pathname: `/stock/user/find-one?stockId=${stockId}&userId=${userId}`,
  });

export default useUserFindOne;
