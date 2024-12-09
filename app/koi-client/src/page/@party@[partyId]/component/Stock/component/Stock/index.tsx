import React, { Suspense, useCallback } from 'react';
import styled from '@emotion/styled';
import { useSearchParams } from 'react-router-dom';
import { SwitchCase } from '@toss/react';
import { Tabs, TabsProps } from 'antd';
import { css } from '@emotion/react';
import Home from './Home';
import Buy from './Buy';
import Sell from './Sell';
import Rule from './Rule';

const navItem = ['홈', '사기', '팔기', '역사'] as const;
type NavName = (typeof navItem)[number];

const items: TabsProps['items'] = [
  {
    children: <></>,
    key: '홈',
    label: '홈',
  },
  {
    children: <></>,
    key: '사기',
    label: '사기',
  },
  {
    children: <></>,
    key: '팔기',
    label: '팔기',
  },
  // {
  //   children: <></>,
  //   key: '기록',
  //   label: '기록',
  // },
  {
    children: <></>,
    key: '룰',
    label: '룰',
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
        case '사기':
          setSearchParams({ page: '사기' }, { replace: true });
          break;
        case '팔기':
          setSearchParams({ page: '팔기' }, { replace: true });
          break;
        // case '기록':
        //   setSearchParams({ page: '기록' }, { replace: true });
        //   break;
        case '룰':
          setSearchParams({ page: '룰' }, { replace: true });
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
        {/* <Header title={searchParams.get('page') ?? ''} /> */}
        <div
          css={css`
            padding: 0 16px;
            background-color: #bbb;
          `}
        >
          <Tabs
            size="large"
            defaultActiveKey={searchParams.get('page') ?? '홈'}
            items={items}
            onChange={onClickTab}
            tabBarStyle={{
              color: '#bbb',
              margin: '0 0 0 0',
            }}
            type="card"
          />
        </div>
        <ContentContainer>
          <Suspense fallback={<></>}>
            <SwitchCase
              value={searchParams.get('page') ?? '홈'}
              caseBy={{
                // 기록: <History stockId={stockId} />,
                룰: <Rule stockId={stockId} />,
                사기: <Buy stockId={stockId} />,
                팔기: <Sell stockId={stockId} />,
                홈: <Home stockId={stockId} />,
              }}
              defaultComponent={<Home stockId={stockId} />}
            />
          </Suspense>
        </ContentContainer>
      </Container>
      {/* <BottomNav /> */}
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
