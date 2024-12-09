import { Response } from 'shared~type-stock';
import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useFinishStock = (stockId: string | undefined) => {
  return useMutation<object, Response.Stock>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: `/stock/finish?stockId=${stockId}`,
    },
  });
};

export default useFinishStock;
