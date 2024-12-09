import { StockSchema } from 'shared~type-stock';
import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useCreateStock = () => {
  return useMutation<object, StockSchema>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/create',
    },
  });
};

export default useCreateStock;
