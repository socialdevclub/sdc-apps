import { useQuery } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../library/supabase';
import { Query } from '../..';

interface Props {
  supabaseSession: Session | null;
}

const useQueryAvatarUrl = ({ supabaseSession }: Props) => {
  const { data: profile, refetch } = Query.Supabase.useMyProfile({ supabaseSession });
  const avatarUrl = profile?.data?.avatar_url;

  const { data, isFetching, isError } = useQuery({
    enabled: !!profile?.data?.avatar_url,
    queryFn: async () => {
      if (avatarUrl.startsWith('http')) {
        return avatarUrl;
      }

      const result = await supabase.storage.from('avatars').download(avatarUrl);
      if (result.error) {
        throw result.error;
      }

      return URL.createObjectURL(result.data);
    },
    queryKey: ['useQueryAvatarUrl', supabaseSession?.user.id, avatarUrl],
    useErrorBoundary: false,
  });

  return { data, isError, isFetching, refetch };
};

export default useQueryAvatarUrl;
