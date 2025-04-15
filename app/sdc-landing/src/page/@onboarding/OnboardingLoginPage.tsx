import React from 'react';
import styled from '@emotion/styled';
import { Auth } from '../../library/supabase/auth';
import { supabase } from '../../library/supabase';
import authLocalization from '../../library/supabase/authLocalization';

const OnboardingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Card = styled.div`
  width: 100%;
  max-width: 500px;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
`;

const Description = styled.p`
  margin-bottom: 30px;
  color: #666;
  line-height: 1.5;
`;

const DiscordButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #5865f2;
  color: white;
  font-weight: bold;
  padding: 12px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #4752c4;
  }
`;

const OnboardingLoginPage: React.FC = () => {
  const redirectTo = `${window.location.origin}/onboarding`;

  return (
    <OnboardingContainer>
      <Card>
        <Title>Discord로 가입하기</Title>
        <Description>
          Discord 계정을 통해 로그인하고 서비스를 이용해보세요. 로그인 후 자동으로 Discord 채널에 가입됩니다.
        </Description>
        <Auth
          supabaseClient={supabase}
          providers={['discord']}
          providerScopes={{
            discord: 'identify email guilds.members.read',
          }}
          localization={authLocalization}
          redirectTo={redirectTo}
          onlyThirdPartyProviders
        />
      </Card>
    </OnboardingContainer>
  );
};

export default OnboardingLoginPage;
