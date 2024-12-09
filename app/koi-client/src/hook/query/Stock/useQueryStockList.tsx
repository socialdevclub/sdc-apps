import { Request, StockSchemaWithId } from 'shared~type-stock';
import { useQuery } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useQueryStockList = (options?: Request.GetStockList) => {
  const { data } = useQuery<StockSchemaWithId[]>({
    api: {
      body: options,
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/list`,
    },
    reactQueryOption: {
      refetchInterval: 1500,
    },
  });

  if (!data) {
    return { data: [] };
  }

  return { data };
};

export default useQueryStockList;
