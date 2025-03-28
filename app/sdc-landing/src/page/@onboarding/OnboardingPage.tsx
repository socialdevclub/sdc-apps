import React from 'react';
import { Navigate } from 'react-router-dom';
import { Query } from '../../hook';

const OnboardingPage: React.FC = () => {
  // 세션 정보 가져오기
  const { data, isLoading } = Query.Supabase.useGetSession();
  const session = data?.session;

  const hasProviderToken = session?.provider_token;

  // 로딩 중이라면 로딩 표시
  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  // 로그인 상태에 따라 리다이렉트
  if (hasProviderToken) {
    // 로그인이 되어있다면 프로필 페이지로 리다이렉트
    return <Navigate to="/onboarding/profile/view" replace />;
  }
  // 로그인이 안되어있다면 로그인 페이지로 리다이렉트
  return <Navigate to="/onboarding/login" replace />;
};

export default OnboardingPage;
