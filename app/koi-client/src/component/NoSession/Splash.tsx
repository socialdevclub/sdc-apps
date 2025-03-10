import styled from '@emotion/styled';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Button } from 'antd';
import { Auth } from '../../library/supabase/auth';
import authLocalization from '../../library/supabase/authLocalization';
import { supabase } from '../../library/supabase';

interface Props {
  onAuthDetail: () => void;
}

const Splash = ({ onAuthDetail }: Props) => {
  return (
    <Layout>
      <Content>
        <Logo src="/no_bg_animal/hamster.webp" alt="hamster" />
        <Title>소셜데브클럽</Title>
        <Description>{`사람과 사람을 연결시켜주는\n소셜 게임을 함께 만들고 즐겨요`}</Description>
      </Content>
      <Footer>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['discord']}
          localization={authLocalization}
          redirectTo={window.location.origin}
          onlyThirdPartyProviders
        />
        <Button type="text" onClick={() => onAuthDetail()}>
          <Text>다른 방법으로 로그인</Text>
        </Button>
      </Footer>
    </Layout>
  );
};

const Layout = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Logo = styled.img`
  width: 100px;
  height: 100px;
`;

const Title = styled.span`
  font-size: 48px;
  margin-top: 14px;
`;

const Description = styled.span`
  font-size: 20px;
  color: #c6c6c8;
  white-space: pre-line;
  text-align: center;
  line-height: 135%;
  margin-top: 43px;
`;

const Footer = styled.div`
  width: 100%;
  margin-top: 172px;
  text-align: center;
  font-size: 14px;
`;

const Text = styled.u`
  color: #c6c6c8;
  font-size: 14px;
  margin-top: 25px;
  cursor: pointer;
`;

export default Splash;
