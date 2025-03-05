import styled from '@emotion/styled';
import { Button, Input, List } from 'antd';
import { css } from '@emotion/react';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useDebounce } from '@toss/react';
import { useDisableScrollView } from '../../../hook/useDisableScrollView';
import { Query } from '../../../../../hook';
import { UserStore } from '../../../../../store';

const rules = [
  {
    emoji: '💌',
    text: '자신을 표현하는 글을 자유롭게 작성해요',
  },
  {
    emoji: '👾',
    text: '작성한 내용을 바탕으로 게임을 진행해요',
  },
  {
    emoji: '✅',
    text: 'MBTI, 직업, 취미 등을 포함해도 좋아요',
  },
  {
    emoji: '🚫',
    text: '닉네임은 적지 마세요',
  },
];

interface Props {
  HeaderComponent?: JSX.Element;
  stockId: string;
}

export default function Introduce({ HeaderComponent = <></>, stockId }: Props) {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { user } = Query.Stock.useUser({ stockId, userId });
  const { mutateAsync: setUser } = Query.Stock.useSetUser();

  const [introduction, setIntroduction] = useState(user?.userInfo.introduction);

  useDisableScrollView();

  const debouncedSetUser = useDebounce((newIntroduction: string) => {
    if (!userId || !user) {
      return;
    }

    setUser({
      stockId,
      userId,
      userInfo: {
        ...user.userInfo,
        introduction: newIntroduction,
      },
    });
  }, 2000);

  const handleIntroductionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newIntroduction = event.target.value;
    setIntroduction(newIntroduction);
    debouncedSetUser(newIntroduction);
  };

  if (!userId || !user) {
    return <></>;
  }

  return (
    <Container>
      {HeaderComponent}
      <BodyContainer>
        <h2>💫 프로필카드 작성</h2>
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
        <Input.TextArea rows={3} value={introduction} onChange={handleIntroductionChange} />
        <Button
          type="primary"
          size="large"
          block
          onClick={async () => {
            setUser({
              stockId,
              userId,
              userInfo: {
                ...user.userInfo,
                introduction,
              },
            });
          }}
        >
          저장하기
        </Button>
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
