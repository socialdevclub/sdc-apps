import { useAtomValue } from 'jotai';
import Header from '../../component-presentation/Header';
import MobileLayout from '../../component-presentation/MobileLayout';
import { UserStore } from '../../store';
import { Query } from '../../hook';
import RoomCodeInput from './component/RoomCodeInput';
import Divider from './component/Divider';
import RoomCreateButton from './component/RoomCreateButton';

export default function Party() {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data } = Query.Supabase.useMyProfile({
    supabaseSession,
  });

  const avatarUrl = data?.data?.avatar_url;
  const username = data?.data?.username;

  return (
    <MobileLayout padding="0px">
      <Header
        title={username}
        avatar={{
          isVisible: true,
          src: avatarUrl,
        }}
      />

      <RoomCodeInput />
      <Divider />
      <RoomCreateButton />
    </MobileLayout>
  );
}
