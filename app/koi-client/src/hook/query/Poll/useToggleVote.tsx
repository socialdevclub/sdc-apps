import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-poll';
import { serverApiUrl } from '../../../config/baseUrl';

const useToggleVote = () => {
  return useMutation<Request.PatchToggleVotes, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/poll/vote/toggle',
    },
  });
};

export default useToggleVote;
