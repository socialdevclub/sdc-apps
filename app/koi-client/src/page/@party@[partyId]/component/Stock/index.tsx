import styled from '@emotion/styled';
import { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { PartySchemaWithId } from 'shared~type-party';
import { useSetAtom } from 'jotai';
import Waiting from './component/Waiting';
import Phase from './component/Phase';
import { UiStore } from '../../../../store';

interface Props {
  party: PartySchemaWithId;
}

export default function Stock({ party }: Props) {
  const [resetKey, setResetKey] = useState(new Date()); // ErrorBoundary를 초기화하기 위한 키
  const setBackgroundColor = useSetAtom(UiStore.backgroundColor);
  const setPadding = useSetAtom(UiStore.padding);

  useEffect(() => {
    setBackgroundColor('#00000000');
    setPadding('0px');
    return () => {
      setBackgroundColor(undefined);
      setPadding(undefined);
    };
  }, [setBackgroundColor, setPadding]);

  if (!party.activityName) {
    return <></>;
  }

  return (
    <Container>
      <ErrorBoundary
        fallback={
          <>
            <div>서버와 통신하는 중 문제가 생겼습니다!</div>
            <div>호스트에게 이 사실을 알리세요!</div>
            <button onClick={() => setResetKey(new Date())}>재시도</button>
          </>
        }
        resetKeys={[resetKey]}
      >
        <Suspense
          fallback={
            <Suspense fallback={<></>}>
              <Waiting />
            </Suspense>
          }
        >
          <Phase stockId={party.activityName} />
        </Suspense>
      </ErrorBoundary>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: white;

  // box-sizing: border-box;
  // padding: 20px;
`;
