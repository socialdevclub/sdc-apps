import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-poll';
import { serverApiUrl } from '../../../config/baseUrl';

const useUpdatePoll = () => {
  return useMutation<Request.PatchPoll, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'PATCH',
      pathname: '/poll',
    },
  });
};

export default useUpdatePoll;
