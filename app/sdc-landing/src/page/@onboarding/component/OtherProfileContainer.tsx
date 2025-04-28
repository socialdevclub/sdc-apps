import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Query } from '../../../hook';
import ProfileView from '../component-presentation/profile/ProfileView';

interface OtherProfileContainerProps {
  username: string;
}

const OtherProfileContainer: React.FC<OtherProfileContainerProps> = ({ username }) => {
  const navigate = useNavigate();

  // 디스코드 관련 데이터 가져오기
  const { isAuthenticated, isFetching: isDiscordLoading } = Query.Supabase.Discord.useQuerySdcGuildUser();

  const { data: profileByUsername, isFetching: isProfileByUsernameLoading } =
    Query.Supabase.useQueryProfileByUsername(username);

  // 디스코드 연동 체크 및 리다이렉트
  useEffect(() => {
    if (!isDiscordLoading && !isAuthenticated) {
      navigate('/onboarding/login');
    }
  }, [isAuthenticated, isDiscordLoading, navigate]);

  return (
    <ProfileView
      isLoading={isProfileByUsernameLoading}
      username={username}
      gender={profileByUsername?.gender}
      avatarUrl={profileByUsername?.avatar_url}
      introduce={profileByUsername?.introduce}
    />
  );
};

export default OtherProfileContainer;
