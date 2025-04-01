import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../library/supabase';

const LIMIT = 9;

interface UseQueryProfilesProps {
  page: number;
}

const useQueryProfiles = ({ page = 0 }: UseQueryProfilesProps) => {
  return useQuery({
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('introduce', null)
        .limit(LIMIT)
        .order('updated_at', { ascending: false })
        .range(page * LIMIT, (page + 1) * LIMIT - 1);

      if (error) {
        throw error;
      }

      return data;
    },
    queryKey: ['profiles', page],
  });
};

export default useQueryProfiles;
