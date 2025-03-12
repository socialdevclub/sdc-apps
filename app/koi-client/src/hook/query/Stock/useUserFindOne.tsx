import { getQueryKey, useQuery } from 'lib-react-query';
import { Response } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

type StockId = string | undefined;

interface Options {
  enabled?: boolean;
}

const useUserFindOne = (stockId: string | undefined, userId: string | undefined, options?: Options) => {
  const enabled = options?.enabled ?? true;

  const { data } = useQuery<Response.GetStockUser>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/user/find-one?stockId=${stockId}&userId=${userId}`,
    },
    reactQueryOption: {
      enabled: !!stockId && !!userId && enabled,
      refetchInterval: 1500,
    },
  });

  return { data };
};
useUserFindOne.queryKey = (stockId: StockId, userId: string | undefined) =>
  getQueryKey({
    hostname: serverApiUrl,
    method: 'GET',
    pathname: `/stock/user/find-one?stockId=${stockId}&userId=${userId}`,
  });

export default useUserFindOne;
