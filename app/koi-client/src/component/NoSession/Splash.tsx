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
  const share = new URLSearchParams(window.location.search).get('share');
  const isSharedByStock = share === 'stock';

  return (
    <Layout>
      <Content>
        <Logo src="/no_bg_animal/hamster.webp" alt="hamster" />
        <Title>소셜데브클럽</Title>
        <Description>{`사람과 사람을 연결시켜주는\n소셜 게임을 함께 만들고 즐겨요`}</Description>
      </Content>
      <Footer isShared={isSharedByStock}>
        {isSharedByStock && (
          <ShareGuide>
            이곳은 소셜데브클럽 통합 로그인 페이지입니다.
            <br />
            간단 가입 후 주식 게임을 바로 즐길 수 있어요!
          </ShareGuide>
        )}
        <Auth
          supabaseClient={supabase}
          appearance={{ style: { container: { margin: '0' } }, theme: ThemeSupa }}
          providers={['discord']}
          localization={authLocalization}
          redirectTo={window.location.origin}
          onlyThirdPartyProviders
        />
        <Button style={{ marginTop: '25px' }} type="text" onClick={() => onAuthDetail()}>
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

const Footer = styled.div<{ isShared: boolean }>`
  width: 100%;
  margin-top: ${({ isShared }) => (isShared ? '99px' : '172px')};
  text-align: center;
  font-size: 14px;
`;

const ShareGuide = styled.span`
  display: inline-block;
  width: 100%;
  padding: 4px 0;
  margin-bottom: 25px;
  border-radius: 8px;
  background-color: #5965f233;
  font-size: 14px;
  color: #5965f2;
  line-height: 135%;
  text-align: center;
`;

const Text = styled.u`
  color: #c6c6c8;
  font-size: 14px;
  margin-top: 25px;
  cursor: pointer;
`;

export default Splash;
