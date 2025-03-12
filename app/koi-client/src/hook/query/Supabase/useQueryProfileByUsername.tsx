import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../library/supabase';

export const fetchProfileByUsername = async (usernames: string[]) => {
  const result = await supabase.from('profiles').select(`id, username, gender, avatar_url`).in('username', usernames);
  return result;
};

const useQueryProfileByUsername = (usernames: string[]) => {
  const { data, isFetching, refetch } = useQuery({
    queryFn: async () => {
      const result = await supabase
        .from('profiles')
        .select(`id, username, gender, avatar_url`)
        .in('username', usernames);

      return result;
    },
    queryKey: ['useQueryProfileByUsername', usernames],
  });

  return { data, isFetching, refetch };
};

export default useQueryProfileByUsername;
