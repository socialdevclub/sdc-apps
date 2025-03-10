import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { useQueryClient } from '@tanstack/react-query';
import { Query } from '../../../../../hook';
import { UserStore } from '../../../../../store';
import { useUserList } from '../../../../../hook/query/Stock';

interface Props {
  stockId: string;
}

const ProfileSetter = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const queryClient = useQueryClient();

  const { data: user } = Query.Supabase.useMyProfile({ supabaseSession });
  const { mutate, isIdle } = Query.Stock.useRegisterUser();

  const userId = user?.data?.id;
  const gender = user?.data?.gender;
  const nickname = user?.data?.username;

  useEffect(() => {
    if (!userId || !gender || !nickname) return;

    if (isIdle) {
      mutate({
        stockId,
        userId,
        userInfo: {
          gender,
          nickname,
        },
      });
      queryClient.invalidateQueries({
        queryKey: useUserList.queryKey(stockId),
      });
    }
  }, [gender, isIdle, mutate, nickname, queryClient, stockId, userId]);

  return <></>;
};

export default ProfileSetter;
