import { useAtomValue } from 'jotai';
import { useQuery } from 'lib-react-query';
import { UserStore } from '../../../store';
import { serverApiUrl } from '../../../config/baseUrl';

interface ReturnType {
  isLoading: boolean;
  partnerNicknames: string[];
  refetch: () => void;
}

export const useRecommendedPartners = (stockId: string | undefined, options?: { enabled: boolean }): ReturnType => {
  const enabled = options?.enabled ?? false;

  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const {
    data: partnerNicknames,
    isLoading,
    refetch,
  } = useQuery<string[]>({
    api: {
      hostname: serverApiUrl,
      method: 'GET',
      pathname: `/stock/user/recommended-partners?stockId=${stockId}&userId=${userId}`,
    },
    reactQueryOption: {
      enabled: Boolean(stockId) && Boolean(userId) && enabled,
      ...options,
    },
  });

  return { isLoading, partnerNicknames: partnerNicknames ?? [], refetch };
};
