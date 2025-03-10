import { useMutation } from 'lib-react-query';
import { serverApiUrl } from '../../../config/baseUrl';

const useUserAlignIndex = (stockId: string) => {
  return useMutation<object, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: `/stock/user/align-index?stockId=${stockId}`,
    },
  });
};

export default useUserAlignIndex;
