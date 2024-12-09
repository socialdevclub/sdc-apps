import { useMutation } from 'lib-react-query';
import { Response } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

const useUpdateGame = (stockId: string | undefined) => {
  return useMutation<object, Response.Stock>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: `/stock/init?stockId=${stockId}`,
    },
  });
};

export default useUpdateGame;
