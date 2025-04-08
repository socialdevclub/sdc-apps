import { useQuery } from 'lib-react-query';
import { APIUser } from 'discord-api-types/v10';
import { Query } from '../../..';

const useQueryUser = () => {
  const { data: session } = Query.Supabase.useGetSession();
  const query = useQuery<APIUser>({
    api: {
      headers: {
        Authorization: `Bearer ${session?.session?.provider_token}`,
      },
      method: 'GET',
      origin: 'https://discord.com',
      pathname: '/api/v10/users/@me',
    },
  });

  return { discordUserId: query.data?.id, ...query };
};

export default useQueryUser;
