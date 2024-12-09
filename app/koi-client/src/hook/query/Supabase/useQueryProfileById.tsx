import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../library/supabase';

const useQueryProfileById = (ids: string[]) => {
  const { data, isFetching, refetch } = useQuery({
    queryFn: async () => {
      const result = await supabase.from('profiles').select(`id, username, gender, avatar_url`).in('id', ids);

      return result;
    },
    queryKey: ['useQueryProfileById', ids],
  });

  return { data, isFetching, refetch };
};

export default useQueryProfileById;
