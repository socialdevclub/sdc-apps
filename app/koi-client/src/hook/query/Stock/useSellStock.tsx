import { Request, Response } from 'shared~type-stock';
import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useSellStock = () => {
  return useMutation<Request.PostSellStock, Response.Stock>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/sell',
    },
  });
};

export default useSellStock;
