import { Request, StockSchemaWithId } from 'shared~type-stock';
import { useQuery } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useQueryStockList = (options?: Request.GetStockList) => {
  const { data, refetch } = useQuery<StockSchemaWithId[]>({
    api: {
      body: options,
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/list`,
    },
  });

  if (!data) {
    return { data: [], refetch };
  }

  return { data, refetch };
};

export default useQueryStockList;
