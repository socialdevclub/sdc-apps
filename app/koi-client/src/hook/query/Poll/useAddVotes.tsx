import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-poll';
import { serverApiUrl } from '../../../config/baseUrl';

const useUpdatePoll = () => {
  return useMutation<Request.PostAddVotes, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/poll/vote/add',
    },
  });
};

export default useUpdatePoll;
