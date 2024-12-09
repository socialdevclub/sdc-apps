import { Request, Response } from 'shared~type-stock';
import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useBuyStock = () => {
  return useMutation<Request.PostBuyStock, Response.Stock>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/buy',
    },
  });
};

export default useBuyStock;
