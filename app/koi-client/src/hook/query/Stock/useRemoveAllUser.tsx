import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

const useRemoveAllUser = (stockId: string) => {
  const { mutateAsync } = useMutation<Request.RemoveAllStockUser>({
    api: {
      hostname: serverApiUrl,
      method: 'DELETE',
      pathname: `/stock/user/all?stockId=${stockId}`,
    },
  });

  return { mutateAsync };
};

export default useRemoveAllUser;
