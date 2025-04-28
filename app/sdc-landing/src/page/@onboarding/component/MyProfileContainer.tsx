import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Query } from '../../../hook';
import ProfileView from '../component-presentation/profile/ProfileView';

const MyProfileContainer: React.FC = () => {
  const navigate = useNavigate();

  const { data: myProfile, isFetching: isMyProfileLoading } = Query.Supabase.useQueryMyProfile();

  const isProfileLoading = isMyProfileLoading;

  return (
    <ProfileView
      isLoading={isProfileLoading}
      username={myProfile?.username}
      gender={myProfile?.gender}
      avatarUrl={myProfile?.avatar_url}
      introduce={myProfile?.introduce}
      onEditProfile={() => {
        navigate('/onboarding/profile/edit');
      }}
    />
  );
};

export default MyProfileContainer;
