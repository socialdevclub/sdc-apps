import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useRemoveStockSession = (stockId: string) => {
  const { mutateAsync } = useMutation({
    api: {
      hostname: serverApiUrl,
      method: 'DELETE',
      pathname: `/stock?stockId=${stockId}`,
    },
  });

  return { mutateAsync };
};

export default useRemoveStockSession;
