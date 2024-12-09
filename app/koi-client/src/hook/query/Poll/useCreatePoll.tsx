import { useMutation } from 'lib-react-query';
import { PollForm } from 'shared~type-poll';
import { serverApiUrl } from '../../../config/baseUrl';

const useCreatePoll = () => {
  return useMutation<PollForm>({
    api: {
      hostname: serverApiUrl,
      method: 'POST',
      pathname: '/poll',
    },
  });
};

export default useCreatePoll;
