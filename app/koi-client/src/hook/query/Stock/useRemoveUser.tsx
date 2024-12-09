import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

const useRemoveUser = () => {
  const { mutateAsync } = useMutation<Request.RemoveStockUser>({
    api: {
      hostname: serverApiUrl,
      method: 'DELETE',
      pathname: `/stock/user`,
    },
  });

  return { mutateAsync };
};

export default useRemoveUser;
