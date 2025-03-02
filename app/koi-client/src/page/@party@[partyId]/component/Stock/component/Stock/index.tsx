import React, { Suspense, useCallback } from 'react';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { SwitchCase } from '@toss/react';
import Buy from './Buy';
import Rule from './Rule';
import { Tabs, type TabsProps } from './Tabs';
import Home from './Home/Home';

const items: TabsProps['items'] = [
  {
    key: '홈',
    label: '홈',
  },
  {
    key: '주식',
    label: '주식',
  },
];

interface Props {
  stockId: string;
}

const Stock = ({ stockId }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const onClickTab = useCallback(
    (key: string) => {
      switch (key) {
        case '홈':
          setSearchParams({ page: '홈' }, { replace: true });
          break;
        case '주식':
          setSearchParams({ page: '주식' }, { replace: true });
          break;
        default:
          setSearchParams({ page: '홈' }, { replace: true });
          break;
      }
    },
    [setSearchParams],
  );

  return (
    <>
      <Container>
        <Tabs defaultActiveKey={searchParams.get('page') ?? '홈'} items={items} onChange={onClickTab} />
        <ContentContainer>
          <Suspense fallback={<></>}>
            <SwitchCase
              value={searchParams.get('page') ?? '홈'}
              caseBy={{
                룰: <Rule stockId={stockId} />,
                주식: <Buy stockId={stockId} />,
                홈: <Home stockId={stockId} />,
              }}
              defaultComponent={<Home stockId={stockId} />}
            />
          </Suspense>
        </ContentContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  color: white;
`;

const ContentContainer = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;

  box-sizing: border-box;
  padding: 12px;
`;

export default Stock;
