import { useQuery } from 'lib-react-query';
import { Response } from 'shared~type-stock';
import { serverApiUrl } from '../../../config/baseUrl';

interface Props {
  stockId: string;
  userId?: string;
  round?: number;
  company?: string;
}

interface Options {
  enabled?: boolean;
  refetchInterval?: number;
}

const useQueryLog = ({ stockId, userId, round, company }: Props, options?: Options) => {
  const enabled = options?.enabled ?? true;
  const refetchInterval = options?.refetchInterval ?? 1500;

  const { data } = useQuery<Response.Log[]>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/log?stockId=${stockId}&userId=${userId}&round=${round}&company=${company}`,
    },
    reactQueryOption: {
      enabled: Boolean(enabled) && !!stockId && !!userId && round !== undefined,
      refetchInterval,
    },
  });

  if (!data) {
    return { data: [] };
  }

  data.forEach((v) => {
    v.date = new Date(v.date);
  });

  return { data };
};

export default useQueryLog;
