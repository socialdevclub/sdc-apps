import { useQuery } from '@tanstack/react-query';
import { getQueryKey } from 'lib-react-query';
import { APIGuildMember } from 'discord-api-types/v10';
import { Query } from '../../..';
import QueryError from '../../../../utils/QueryError';
import withSessionStorage from '../../../../utils/withSessionStorage';

const SDC_GUILD_ID = '1311649881164611586';
const CACHE_KEY = 'sdc_guild_user_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5분 (밀리초)

const queryKey = (discordToken?: string | null) => [
  ...getQueryKey({
    method: 'GET',
    origin: 'https://discord.com',
    pathname: `/api/v10/users/@me/guilds/${SDC_GUILD_ID}/member`,
  }),
  discordToken,
];

const useQuerySdcGuildUser = () => {
  const { data: session } = Query.Supabase.useGetSession();
  const query = useQuery<APIGuildMember, QueryError>({
    // 캐시 데이터 유지 (10분)
    cacheTime: 10 * 60 * 1000,

    enabled: !!session?.session?.provider_token,

    queryFn: async (): Promise<APIGuildMember> => {
      // withSessionStorage 유틸리티를 사용하여 API 호출과 캐싱 처리
      const fetchGuildUser = async (): Promise<APIGuildMember> => {
        const url = `https://discord.com/api/v10/users/@me/guilds/${SDC_GUILD_ID}/member`;
        const headers = {
          Authorization: `Bearer ${session?.session?.provider_token}`,
          'Content-Type': 'application/json',
        };

        const res = await fetch(url, {
          headers,
          method: 'GET',
        });

        const data = await res.json();

        if (!res.ok) {
          throw new QueryError(data.message, data.code);
        }

        return data;
      };

      // SessionStorage 캐싱 적용
      const fetchWithCache = withSessionStorage<APIGuildMember>(fetchGuildUser, CACHE_KEY, CACHE_DURATION);

      return fetchWithCache();
    },

    queryKey: queryKey(session?.session?.provider_token),

    refetchOnMount: false,

    refetchOnReconnect: false,

    refetchOnWindowFocus: false,

    retry: false,

    // 캐싱 시간 길게 설정 (5분)
    staleTime: 5 * 60 * 1000,
  });
  console.log('🚀 ~ useQuerySdcGuildUser ~ query:', query);

  const nickname = query.data?.nick || query.data?.user?.global_name;
  const isJoined = Boolean(nickname);

  const isAuthenticated = !query.error?.message.includes('Unauthorized') && !!session?.session?.provider_token;
  const isRateLimited = query.error?.message.includes('rate limited');

  return {
    isAuthenticated,
    isJoined,
    isRateLimited,
    nickname,
    ...query,
  };
};

export default useQuerySdcGuildUser;
