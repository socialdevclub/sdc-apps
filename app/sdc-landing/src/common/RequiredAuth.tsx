import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Query } from '../hook';

interface RequiredAuthProps {
  children: React.ReactNode;
}

const RequiredAuth = ({ children }: RequiredAuthProps) => {
  const navigate = useNavigate();

  const { isAuthenticated, isFetching: isDiscordLoading } = Query.Supabase.Discord.useQuerySdcGuildUser();

  // 디스코드 연동 체크 및 리다이렉트
  useEffect(() => {
    if (!isDiscordLoading && !isAuthenticated) {
      navigate('/onboarding/login');
    }
  }, [isAuthenticated, isDiscordLoading, navigate]);

  if (isDiscordLoading) {
    return null;
  }

  return <>{children}</>;
};

export default RequiredAuth;
