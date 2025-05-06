import { getDateDistance } from '@toss/date';
import { objectEntries } from '@toss/utils';
import { Response } from 'shared~type-stock';
import { useQuery } from 'lib-react-query';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useAtomValue } from 'jotai';
import { serverApiUrl } from '../../../config/baseUrl';
import { UserStore } from '../../../store';

interface Params {
  stockId: string | undefined;
  /**
   * 모든 유저 정보를 로드할지 여부 (되도록 쓰지 마세요)
   */
  isLoadAllUser?: boolean;
  /**
   * 특정 유저 정보를 로드할지 여부
   */
  userId?: string;
}

interface Options {
  enabled?: boolean;
  keepPreviousData?: boolean;
  refetchInterval?: number;
}

const useQueryStock = (params: Params, options?: Options) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const enabled = options?.enabled ?? true;
  const userIdQuery = params.userId ? `&userId=${params.userId}` : `&userId=${userId}`;
  const isLoadAllUserQuery = params.isLoadAllUser ? `&isLoadAllUser=${params.isLoadAllUser}` : '';

  const { data, refetch } = useQuery<Response.GetStock>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock?stockId=${params.stockId}${userIdQuery}${isLoadAllUserQuery}`,
    },
    reactQueryOption: {
      enabled: !!params.stockId && enabled,
      refetchInterval: 1500,
      ...options,
    },
  });

  const timeIdx = useMemo(
    () =>
      data?.startedTime
        ? Math.floor(getDateDistance(dayjs(data.startedTime).toDate(), new Date()).minutes / data.fluctuationsInterval)
        : undefined,
    [data?.fluctuationsInterval, data?.startedTime],
  );

  const companiesPrice = useMemo(
    () =>
      data?.startedTime && timeIdx !== undefined
        ? objectEntries(data.companies).reduce((source, [company, companyInfos]) => {
            if (timeIdx > 9) {
              source[company] = companyInfos[9].가격;
              return source;
            }

            source[company] = companyInfos[timeIdx].가격;
            return source;
          }, {} as Record<string, number>)
        : {},
    [data?.companies, data?.startedTime, timeIdx],
  );

  const companies = useMemo(() => data?.companies ?? {}, [data?.companies]);

  return { companies, companiesPrice, data, refetch, timeIdx };
};

export default useQueryStock;
