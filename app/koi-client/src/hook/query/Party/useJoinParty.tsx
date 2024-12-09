import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-party';
import { serverApiUrl } from '../../../config/baseUrl';

const useJoinParty = () => {
  return useMutation<Request.PostJoinParty, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/party/join',
    },
  });
};

export default useJoinParty;
