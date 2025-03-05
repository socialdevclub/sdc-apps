import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { Query } from '../../../../../hook';
import { UserStore } from '../../../../../store';

interface Props {
  stockId: string;
}

const ProfileSetter = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data: user } = Query.Supabase.useMyProfile({ supabaseSession });
  const { mutateAsync } = Query.Stock.useSetUser();

  const userId = user?.data?.id;

  useEffect(() => {
    mutateAsync({
      index: 0,
      inventory: {},
      lastActivityTime: new Date(),
      loanCount: 0,
      money: 1000000,
      stockId,
      userId,
      userInfo: {
        gender: user?.data?.gender,
        nickname: user?.data?.username,
      },
    });
  }, [mutateAsync, stockId, user?.data?.gender, user?.data?.username, userId]);

  return <></>;
};

export default ProfileSetter;
