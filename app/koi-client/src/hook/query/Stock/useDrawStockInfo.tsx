import { Request, Response } from 'shared~type-stock';
import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useDrawStockInfo = () => {
  return useMutation<Request.PostDrawStockInfo, Response.Stock>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/draw-info',
    },
  });
};

export default useDrawStockInfo;
