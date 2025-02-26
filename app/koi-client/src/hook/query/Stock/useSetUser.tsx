import { useMutation } from 'lib-react-query';
import { StockUserSchema } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

type SetUserParams = Pick<StockUserSchema, 'stockId' | 'userId'> & Omit<Partial<StockUserSchema>, 'stockId' | 'userId'>;

const useSetUser = () => {
  return useMutation<SetUserParams, StockUserSchema[]>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/user',
    },
  });
};

export default useSetUser;
