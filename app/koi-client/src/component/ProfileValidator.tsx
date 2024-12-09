import { useAtomValue } from 'jotai';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserStore } from '../store';
import { Query } from '../hook';

interface Props {
  children: React.ReactNode;
}

const ProfileValidator = ({ children }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const navigate = useNavigate();

  const { data, isFetching } = Query.Supabase.useMyProfile({ supabaseSession });
  const username = data?.data?.username;

  useEffect(() => {
    if (!isFetching && !username) {
      navigate('/profile');
    }
  }, [isFetching, navigate, username]);

  return <>{children}</>;
};

export default ProfileValidator;
