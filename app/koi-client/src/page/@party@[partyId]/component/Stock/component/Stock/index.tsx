import styled from '@emotion/styled';
import { SwitchCase } from '@toss/react';
import { Suspense, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import Home from './Home/Home';
import Information from './Information';
import StockList from './StockList';
import { Tabs, type TabsProps } from './Tabs';

const items: TabsProps['items'] = [
  {
    key: '홈',
    label: '홈',
  },
  {
    key: '정보',
    label: '정보',
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
  const [messageApi, contextHolder] = message.useMessage();

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.parentElement?.parentElement?.parentElement?.scrollTo({ top: 0 });
    }
  }, [searchParams]);

  const onClickTab = useCallback(
    (key: string) => {
      switch (key) {
        case '홈':
          setSearchParams({ page: '홈' }, { replace: true });
          break;
        case '정보':
          setSearchParams({ page: '정보' }, { replace: true });
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
    <Container ref={contentRef}>
      <Tabs defaultActiveKey={searchParams.get('page') ?? '홈'} items={items} onChange={onClickTab} />
      <ContentContainer>
        <Suspense fallback={<></>}>
          {contextHolder}
          <SwitchCase
            value={searchParams.get('page') ?? '홈'}
            caseBy={{
              // 룰: <Rule stockId={stockId} />,
              정보: <Information stockId={stockId} messageApi={messageApi} />,
              주식: <StockList stockId={stockId} messageApi={messageApi} />,
              홈: <Home stockId={stockId} messageApi={messageApi} />,
            }}
            defaultComponent={<Home stockId={stockId} messageApi={messageApi} />}
          />
        </Suspense>
      </ContentContainer>
    </Container>
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
  padding: 16px;
  padding-bottom: 108px;
`;

export default Stock;
