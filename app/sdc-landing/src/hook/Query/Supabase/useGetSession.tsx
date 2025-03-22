import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../library/supabase';

const useGetSession = () => {
  return useQuery({
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    },
    queryKey: ['supabase', 'getSession'],
  });
};

export default useGetSession;
