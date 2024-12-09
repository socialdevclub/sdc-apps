import { useQuery } from 'lib-react-query';
import { PollSchemaWithId } from 'shared~type-poll';
import { serverApiUrl } from '../../../config/baseUrl';

const useQueryPollList = () => {
  const { data } = useQuery<PollSchemaWithId[]>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: '/poll',
    },
  });

  return { data };
};

export default useQueryPollList;
