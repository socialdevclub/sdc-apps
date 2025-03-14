import { getQueryKey, useQuery } from 'lib-react-query';
import { Response } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

type StockId = string | undefined;

interface Options {
  enabled?: boolean;
}

const useUserList = (stockId: StockId, options?: Options) => {
  const enabled = options?.enabled ?? true;
  return useQuery<Response.GetStockUser[]>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/user?stockId=${stockId}`,
    },
    reactQueryOption: {
      enabled: !!stockId && enabled,
      refetchInterval: 1500,
    },
  });
};
useUserList.queryKey = (stockId: StockId) =>
  getQueryKey({
    hostname: serverApiUrl,
    method: 'GET',
    pathname: `/stock/user?stockId=${stockId}`,
  });

export default useUserList;
