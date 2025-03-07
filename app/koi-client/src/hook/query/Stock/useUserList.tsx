import { getQueryKey, useQuery } from 'lib-react-query';
import { Response } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

type StockId = string | undefined;

const useUserList = (stockId: StockId) => {
  const { data } = useQuery<Response.GetStockUser[]>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/user?stockId=${stockId}`,
    },
    reactQueryOption: {
      enabled: !!stockId,
      refetchInterval: 1500,
    },
  });

  return { data: data ?? [] };
};
useUserList.queryKey = (stockId: StockId) =>
  getQueryKey({
    hostname: serverApiUrl,
    method: 'GET',
    pathname: `/stock/user?stockId=${stockId}`,
  });

export default useUserList;
