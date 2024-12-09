import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-party';
import { serverApiUrl } from '../../../config/baseUrl';

const useUpdateParty = () => {
  return useMutation<Request.PatchParty, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'PATCH',
      pathname: '/party',
    },
  });
};

export default useUpdateParty;
