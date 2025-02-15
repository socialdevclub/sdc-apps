import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

const useSetPhase = () => {
  return useMutation<Request.PostSetStockPhase, void>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/stock/phase',
    },
  });
};

export default useSetPhase;
