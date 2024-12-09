import { useQuery } from 'lib-react-query';
import { Response } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

const useUserList = (stockId: string) => {
  const { data } = useQuery<Response.GetStockUser[]>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/user?stockId=${stockId}`,
    },
    reactQueryOption: {
      refetchInterval: 1500,
    },
  });

  return { data: data ?? [] };
};

export default useUserList;
