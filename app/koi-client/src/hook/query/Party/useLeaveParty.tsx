import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-party';
import { serverApiUrl } from '../../../config/baseUrl';

const useLeaveParty = () => {
  return useMutation<Request.PostLeaveParty, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/party/leave',
    },
  });
};

export default useLeaveParty;
