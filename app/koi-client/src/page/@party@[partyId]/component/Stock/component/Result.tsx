import React from 'react';
import styled from '@emotion/styled';
import { useAtomValue } from 'jotai';
import { commaizeNumber } from '@toss/utils';
import { Button } from 'antd';
import html2canvas from 'html2canvas';
import saveAs from 'file-saver';
import { css } from '@linaria/core';
import { UserStore } from '../../../../../store';
import { Query } from '../../../../../hook';

interface Props {
  stockId: string;
}

const Result = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);
  const { getRound0Avg, getRound12Avg } = Query.Stock.useQueryResult(stockId);

  const captureAreaRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!captureAreaRef.current) return;

    try {
      const div = captureAreaRef.current;
      div.style.backgroundImage = 'url(/background.jpg)';
      const canvas = await html2canvas(div);
      canvas.toBlob((blob) => {
        if (blob !== null) {
          saveAs(blob, 'result.png');
        }
      });
    } catch (error) {
      console.error('Error converting div to image:', error);
    } finally {
      if (captureAreaRef.current) {
        captureAreaRef.current.style.backgroundImage = '';
      }
    }
  };

  if (!stock || !supabaseSession || !users) {
    return <></>;
  }

  const userId = supabaseSession.user.id;
  const getRoundAvg = stock.round === 0 ? getRound0Avg : getRound12Avg;
  const roundAvg = getRoundAvg(userId);
  const fluctuation = roundAvg - 1000000;
  const percentage = fluctuation / 10000;

  const animal =
    percentage < 0
      ? 'hamster'
      : percentage < 100
      ? 'rabbit'
      : percentage < 150
      ? 'cat'
      : percentage < 200
      ? 'dog'
      : percentage < 250
      ? 'wolf'
      : percentage < 300
      ? 'tiger'
      : 'dragon';

  const animalResult =
    animal === 'hamster'
      ? '당돌한 햄스터'
      : animal === 'rabbit'
      ? '순수한 토끼'
      : animal === 'cat'
      ? '세련된 고양이'
      : animal === 'dog'
      ? '활발한 강아지'
      : animal === 'wolf'
      ? '카리스마 늑대'
      : animal === 'tiger'
      ? '타고난 호랑이'
      : '전설적인 드래곤';

  const animalDescription =
    animal === 'hamster'
      ? '겉보기와 달리 대담하고 당돌한 매력을 가진 햄스터예요. 때로는 장난스럽게 속이고 때로는 예측불가한 행동으로 게임의 재미를 한층 더해주는 빌런이에요.'
      : animal === 'rabbit'
      ? '순수하고 친근한 매력으로 주변 사람들과 쉽게 어울리는 토끼예요. 밝은 에너지가 매력적이에요.'
      : animal === 'cat'
      ? '세련된 매력과 독특한 개성으로 사람들의 시선을 사로잡는 고양이예요. 묘한 매력을 풍기며 관심을 끌어요.'
      : animal === 'dog'
      ? '누구와도 잘 어울리고 밝은 에너지로 분위기를 이끄는 강아지예요. 많은 사람들이 함께하고 싶어해요.'
      : animal === 'wolf'
      ? '강한 카리스마와 직관력으로 상대방의 진심을 꿰뚫어보는 늑대예요. 신뢰할 수 있는 파트너가 되어줘요.'
      : animal === 'tiger'
      ? '타고난 리더십으로 팀을 이끌고 신뢰를 쌓아가는 호랑이예요. 함께하면 더 큰 시너지를 만들어낼 수 있어요.'
      : '전설적인 케미의 드래곤이예요. 뛰어난 통찰력과 매력으로 모든 이의 마음을 사로잡고 최고의 팀워크를 만들어요.';

  const sortedUser = [...users].sort((a, b) => getRoundAvg(b.userId) - getRoundAvg(a.userId));
  const rank = sortedUser.findIndex((v) => v.userId === userId) + 1;
  const rankPercentage = Math.floor(Math.max(((rank - 1) / users.length) * 100, 1));

  return (
    <Container data-f="FE-5472">
      <CaptureArea ref={captureAreaRef}>
        <Title>주식게임{stock.round === 0 && ' 연습게임'} 결과</Title>
        <Wrapper>
          <Box>
            <BoxContainer>
              <TitleContainer>
                <Name>{animalResult}</Name>
              </TitleContainer>
              <AnimalImg src={`/animal/${animal}.jpg`} />
              <Text>{animalDescription}</Text>
              <Text>
                순수익 : {commaizeNumber(fluctuation)}원 ({percentage.toFixed(2)}%)
              </Text>
              <Text>
                랭킹 : {rank}위 (상위 {rankPercentage}%)
              </Text>
            </BoxContainer>
          </Box>
        </Wrapper>
      </CaptureArea>
      <Button
        className={css`
          margin-bottom: 35px;
        `}
        onClick={() => handleDownload()}
      >
        이미지 저장
      </Button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CaptureArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  width: 100%;
  box-sizing: border-box;
  padding: 35px;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  box-shadow: 5px 5px #000000;
  background-color: #000084;
`;

const BoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 50px 0;
  gap: 16px;
`;

const AnimalImg = styled.img`
  width: 250px;
  height: 250px;
  margin: 16px;
`;

const Text = styled.div`
  width: 250px;
  text-align: center;
  word-break: keep-all;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const Title = styled.div`
  margin-top: 35px;

  font-size: larger;
  text-shadow: 2px 2px #8461f8;
`;

const Name = styled.div`
  font-size: xx-large;
`;

export default Result;
