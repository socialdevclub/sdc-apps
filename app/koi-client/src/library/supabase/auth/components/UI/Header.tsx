import styled from '@emotion/styled';
import { ChevronLeft } from 'lucide-react';
import { VIEWS, ViewType } from '@supabase/auth-ui-shared';

function AuthHeader({
  authView,
  handleAuthView,
  handleRouteChange,
}: {
  authView: ViewType;
  handleAuthView: (newView: ViewType) => void;
  handleRouteChange?: (newRoute: string) => void;
}) {
  const isEmailAuth = authView === VIEWS.SIGN_IN;

  const handleClickBackButton = () => {
    if (isEmailAuth) {
      if (handleRouteChange) {
        handleRouteChange('SPLASH');
      }
    } else {
      handleAuthView(VIEWS.SIGN_IN);
    }
  };

  return (
    <Wrapper>
      <Content>
        <Button onClick={handleClickBackButton}>
          <ChevronLeft size={35} color="gray" />
        </Button>
      </Content>
    </Wrapper>
  );
}

export default AuthHeader;

const Wrapper = styled.div`
  width: 100%;
  height: 60px;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  max-width: 400px;
  background-color: #f2f2f2;
`;

const Button = styled.button`
  cursor: pointer;
  border: none;
  height: 100%;
`;
