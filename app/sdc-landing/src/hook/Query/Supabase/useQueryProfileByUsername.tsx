import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../library/supabase';

const useQueryMyProfileByUsername = (username: string | undefined) => {
  return useQuery({
    enabled: !!username,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();

      if (error) {
        throw error;
      }

      return data;
    },
    queryKey: ['useQueryMyProfileByUsername', username],
    retry: false,
  });
};

export default useQueryMyProfileByUsername;
