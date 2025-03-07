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
          css={css({ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '16px', width: '100%' })}
          dataSource={rules}
          size="large"
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<>{item.emoji}</>}
                title={<span css={css({ color: '#ffffff', wordBreak: 'keep-all' })}>{item.text}</span>}
              />
            </List.Item>
          )}
        />
        <Card title="첫번째 프로필" css={css({ overflowWrap: 'break-word', width: '100%' })}>
          {userList?.[prevIndex]?.userInfo.introduction}
        </Card>
        <Card title="두번째 프로필" css={css({ overflowWrap: 'break-word', width: '100%' })}>
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
  /* justify-content: center; */
  align-items: center;
  width: 100%;
  height: 100%;
  gap: 16px;
`;
