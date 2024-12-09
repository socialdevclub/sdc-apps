import { useMutation } from 'lib-react-query';
import { StockUserSchema } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

const useSetUser = () => {
  return useMutation<StockUserSchema, StockUserSchema[]>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/user',
    },
  });
};

export default useSetUser;
