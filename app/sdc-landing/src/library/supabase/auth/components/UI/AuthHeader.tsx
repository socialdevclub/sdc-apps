import styled from '@emotion/styled';
import { ChevronLeft } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
import { MEDIA_QUERY } from '../../../../../config/common';

function AuthHeader({ onClickBack }: { onClickBack: () => void }) {
  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });

  return (
    <Wrapper>
      <Content isDesktop={isDesktop}>
        <Button onClick={onClickBack}>
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

const Content = styled.div<{ isDesktop: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  max-width: ${({ isDesktop }) => (isDesktop ? '400px' : '100%')};
  background-color: #f2f2f2;
`;

const Button = styled.button`
  cursor: pointer;
  border: none;
  height: 100%;
`;
