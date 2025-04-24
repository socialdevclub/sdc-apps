import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import OtherProfileContainer from './component/OtherProfileContainer';
import MyProfileContainer from './component/MyProfileContainer';
import RequiredAuth from '../../component/RequiredAuth';

// 프로필 컴포넌트
const ProfileViewPage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();

  // username 파라미터가 있으면 다른 사용자의 프로필을 보여주고,
  // 없으면 자신의 프로필을 보여줍니다.
  return username ? (
    <ErrorBoundary
      fallback={<></>}
      onError={(error) => {
        if (error.message === 'JSON object requested, multiple (or no) rows returned') {
          navigate('/onboarding');
        }
      }}
    >
      <OtherProfileContainer username={username} />
    </ErrorBoundary>
  ) : (
    <RequiredAuth>
      <MyProfileContainer />
    </RequiredAuth>
  );
};

export default ProfileViewPage;
