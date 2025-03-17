import styled from '@emotion/styled';
import { Card, List } from 'antd';
import { css } from '@emotion/react';
import { useAtomValue } from 'jotai';
import { Query } from '../../../../../hook';
import { UserStore } from '../../../../../store';
import { useDisableScrollView } from '../../../hook/useDisableScrollView';

const rules = [
  {
    emoji: '🕵️',
    text: '아래 두 사람을 찾아보세요',
  },
];

interface Props {
  HeaderComponent?: JSX.Element;
  stockId: string;
}

export default function IntroduceResult({ HeaderComponent = <></>, stockId }: Props) {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: userList } = Query.Stock.useUserList(stockId);
  const { user } = Query.Stock.useUser({ stockId, userId });

  useDisableScrollView();

  if (!userId || !user) {
    return <></>;
  }

  const userIndex = userList?.findIndex((user) => user.userId === userId);
  const prevIndex = userIndex === 0 ? userList.length - 1 : userIndex - 1;
  const nextIndex = userIndex === userList.length - 1 ? 0 : userIndex + 1;

  return (
    <Container>
      {HeaderComponent}
      <BodyContainer>
        <h2>🔍 프로필 추리하기</h2>
        <List
          css={css({
            backgroundColor: 'rgba(217,217,217,0.2)',
            border: '1px solid rgba(96, 96, 96, 0.5)',
            borderRadius: '8px',
            width: '100%',
          })}
          dataSource={rules}
          size="large"
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<>{item.emoji}</>}
                title={
                  <span css={css({ color: '#ffffff', fontSize: '16px', wordBreak: 'keep-all' })}>{item.text}</span>
                }
              />
            </List.Item>
          )}
        />
        <Card
          title="🙋🏻‍ 첫번째 프로필"
          css={css({
            '& .ant-card-head': {
              borderBottom: '1px solid rgba(96, 96, 96, 0.5)',
              color: '#ffffff',
            },
            backgroundColor: 'rgba(217,217,217,0.2)',
            border: '1px solid rgba(96, 96, 96, 0.5)',
            color: '#ffffff',
            minHeight: '230px',
            overflowWrap: 'break-word',
            width: '100%',
          })}
        >
          <MatchingReason>📌 당신과 이름이 비슷해요!</MatchingReason>
          {userList?.[prevIndex]?.userInfo.introduction}
        </Card>
        <Card
          title="🙋🏻‍ 두번째 프로필"
          css={css({
            '& .ant-card-head': {
              borderBottom: '1px solid rgba(96, 96, 96, 0.5)',
              color: '#ffffff',
            },
            backgroundColor: 'rgba(217,217,217,0.2)',
            border: '1px solid rgba(96, 96, 96, 0.5)',
            color: '#ffffff',
            minHeight: '230px',
            overflowWrap: 'break-word',
            width: '100%',
          })}
        >
          <MatchingReason>📌 당신과 비슷한 관심사를 가지고 있어요!</MatchingReason>
          {userList?.[nextIndex]?.userInfo.introduction}
        </Card>
      </BodyContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
`;

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 16px;
`;

const MatchingReason = styled.p`
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #ffcc00;
  margin-bottom: 8px;
  margin-top: 0;
`;
