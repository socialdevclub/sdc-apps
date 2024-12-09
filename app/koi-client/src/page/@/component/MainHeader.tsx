import React from 'react';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Query } from '../../../hook';
import { UserStore } from '../../../store';
import Header from '../../../component-presentation/Header';
import ProfileValidator from '../../../component/ProfileValidator';

const MainHeader = () => {
  const navigate = useNavigate();
  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data, isError } = Query.Supabase.useQueryAvatarUrl({ supabaseSession });

  const isVisibleAvatar = !!data && !isError;

  return (
    <ProfileValidator>
      <Header
        avatar={{
          isVisible: isVisibleAvatar,
          onClick: () => {
            navigate('/profile');
          },
          src: data,
        }}
      />
    </ProfileValidator>
  );
};

export default MainHeader;
