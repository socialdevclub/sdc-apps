import { Response } from 'shared~type-stock';
import { useCallback } from 'react';
import { useQuery } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useQueryResult = (stockId: string | undefined) => {
  const { data } = useQuery<Response.Result[]>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/result?stockId=${stockId}`,
    },
    reactQueryOption: {
      refetchInterval: 1500,
    },
  });

  const getRound0Avg = useCallback(
    (userId: string) => {
      return data?.filter((v) => v.userId === userId && v.round === 0).reduce((acc, v) => acc + v.money, 0) ?? 0;
    },
    [data],
  );

  const getRound12Avg = useCallback(
    (userId?: string) => {
      return data ? Math.max(...data.filter((v) => v.userId === userId && v.round > 0).map((v) => v.money)) : 0;
    },
    [data],
  );

  return { data: data ?? [], getRound0Avg, getRound12Avg };
};

export default useQueryResult;
