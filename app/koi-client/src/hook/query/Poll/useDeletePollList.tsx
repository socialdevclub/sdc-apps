import { useMutation } from 'lib-react-query';
import { Request } from 'shared~type-poll';
import { serverApiUrl } from '../../../config/baseUrl';

const useDeletePollList = () => {
  return useMutation<Request.DeletePolls, boolean>({
    api: {
      hostname: serverApiUrl,
      method: 'DELETE',
      pathname: '/poll',
    },
  });
};

export default useDeletePollList;
