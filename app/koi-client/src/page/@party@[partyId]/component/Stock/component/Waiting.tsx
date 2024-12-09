import styled from '@emotion/styled';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { UiStore, UserStore } from '../../../../../store';
import { Query } from '../../../../../hook';

interface Props {
  HeaderComponent?: JSX.Element;
}

const Waiting = ({ HeaderComponent = <></> }: Props) => {
  const setIsScrollView = useSetAtom(UiStore.isScrollView);

  useEffect(() => {
    setIsScrollView(false);
    return () => {
      setIsScrollView(true);
    };
  }, [setIsScrollView]);

  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const { data } = Query.Supabase.useMyProfile({ supabaseSession });

  return (
    <Container>
      {HeaderComponent}
      <BodyContainer>
        <div>반갑습니다 {data?.data?.username}님,</div>
        <br />
        <div>호스트의 지시를 따라주세요</div>
        <span />
      </BodyContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export default Waiting;
