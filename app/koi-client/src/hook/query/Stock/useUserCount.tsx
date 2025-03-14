import { getQueryKey, useQuery } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

interface Props {
  stockId: string;
}

const useUserCount = ({ stockId }: Props) => {
  return useQuery<{ count: number }>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/user/count?stockId=${stockId}`,
    },
    reactQueryOption: {
      enabled: !!stockId,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  });
};
useUserCount.queryKey = (stockId: string) =>
  getQueryKey({
    hostname: serverApiUrl,
    method: 'GET',
    pathname: `/stock/user/count?stockId=${stockId}`,
  });

export default useUserCount;
