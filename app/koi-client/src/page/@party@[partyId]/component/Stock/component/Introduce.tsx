import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useDebounce } from '@toss/react';
import { List } from 'antd';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import * as COLOR from '../../../../../config/color';
import { Query } from '../../../../../hook';
import { UserStore } from '../../../../../store';
import { useDisableScrollView } from '../../../hook/useDisableScrollView';

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
          css={css({
            '& .ant-list-item': {
              borderBottom: '1px solid rgba(96, 96, 96, 0.5)',
            },
            backgroundColor: 'rgba(217,217,217,0.2)',
            borderRadius: '16px',
            width: '100%',
          })}
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
        <IntroduceArea
          rows={3}
          value={introduction}
          onChange={handleIntroductionChange}
          placeholder="프로필카드를 작성해보세요."
        />
        <StickyBottom>
          <SaveButton
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
          </SaveButton>
        </StickyBottom>
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
  position: relative;
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

const IntroduceArea = styled.textarea`
  width: 100%;
  height: 100px;
  padding: 16px;
  border-radius: 16px;
  background-color: rgba(217, 217, 217, 0.2);
  color: #ffffff;
  font-size: 12px;
  resize: none;
  border: none;
  outline: none;
  box-sizing: border-box;
  border: 1px solid #616161;
  font-family: 'DungGeunMo';
`;

const StickyBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #252836;
  border-top: 1px solid #374151;
  padding: 20px;
  box-sizing: border-box;
`;

const SaveButton = styled.button`
  background-color: ${COLOR.BottomButtonBlue};
  width: 100%;
  font-family: 'DungGeunMo';
  padding: 16px;
  height: 56px;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  border: none;
  &:hover > span {
    color: white;
  }
  &:disabled {
    opacity: 50%;
    cursor: not-allowed;
  }
  cursor: pointer;
`;
