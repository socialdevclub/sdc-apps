import { useQuery } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../library/supabase';

interface Props {
  supabaseSession: Session | null;
}

const useMyProfile = ({ supabaseSession }: Props) => {
  const { data, isFetching, refetch } = useQuery({
    enabled: !!supabaseSession?.user,
    queryFn: async () => {
      const result = await supabase
        .from('profiles')
        .select(`id, username, gender, avatar_url`)
        .eq('id', supabaseSession?.user.id)
        .single();

      return result;
    },
    queryKey: ['useMyProfile', supabaseSession?.user.id],
  });

  return { data, isFetching, refetch };
};

export default useMyProfile;
