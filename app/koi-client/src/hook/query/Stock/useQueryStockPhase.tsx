import { Response } from 'shared~type-stock';
import { useQuery } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useQueryStockPhase = (stockId: string | undefined) => {
  const { data } = useQuery<Response.GetStockPhase>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/phase?stockId=${stockId}`,
    },
    reactQueryOption: {
      enabled: !!stockId,
      refetchInterval: 1500,
    },
  });

  return { stockPhase: data?.stockPhase };
};

export default useQueryStockPhase;
