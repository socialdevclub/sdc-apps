import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../library/supabase';
import { Query } from '../..';

const useQueryMyProfile = () => {
  const { data: session } = Query.Supabase.useGetSession();

  return useQuery({
    enabled: !!session?.session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session?.session?.user?.id).single();

      if (error) {
        throw error;
      }

      return data;
    },
    queryKey: ['useQueryMyProfile'],
  });
};

export default useQueryMyProfile;
