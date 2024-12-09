import { Request, Response } from 'shared~type-stock';
import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useUpdateStock = () => {
  return useMutation<Request.PatchUpdateStock, Response.Stock>({
    api: {
      hostname: serverApiUrl,
      method: 'PATCH',
      pathname: '/stock',
    },
  });
};

export default useUpdateStock;
