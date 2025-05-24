import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import Header from '../../component-presentation/Header';
import MobileLayout from '../../component-presentation/MobileLayout';
import { UserStore } from '../../store';
import { Query } from '../../hook';
import RoomCodeInput from './component/RoomCodeInput';
import Divider from './component/Divider';
import RoomCreateButton from './component/RoomCreateButton';

export default function Party() {
  const navigate = useNavigate();
  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data } = Query.Supabase.useMyProfile({
    supabaseSession,
  });

  const avatar = Query.Supabase.useQueryAvatarUrl({ supabaseSession });

  const isVisibleAvatar = !avatar.isError;
  const username = data?.data?.username;

  return (
    <MobileLayout padding="0px">
      <Header
        title={username}
        avatar={{
          isVisible: isVisibleAvatar,
          onClick: () => {
            navigate('/profile');
          },
          src: avatar?.data,
        }}
      />

      <RoomCodeInput />
      <Divider />
      <RoomCreateButton username={username} />
    </MobileLayout>
  );
}
