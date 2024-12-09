import { styled } from '@linaria/react';
import { Suspense } from 'react';
import MobileLayout from '../../component-presentation/MobileLayout';
import MainHeader from './component/MainHeader';
import Header from '../../component-presentation/Header';
import PartyList from './component/PartyList';

export default function Main() {
  return (
    <MobileLayout
      HeaderComponent={
        <Suspense fallback={<Header />}>
          <MainHeader />
        </Suspense>
      }
    >
      <Wrapper>
        <PartyList />
      </Wrapper>
    </MobileLayout>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
`;
