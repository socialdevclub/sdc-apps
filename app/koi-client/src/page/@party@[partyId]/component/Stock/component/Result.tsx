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

  if (!stock || !supabaseSession) {
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
      ? '세심한 고양이'
      : animal === 'dog'
      ? '활발한 강아지'
      : animal === 'wolf'
      ? '도전적인 늑대'
      : animal === 'tiger'
      ? '전략적인 호랑이'
      : '전설적인 드래곤';

  const animalDescription =
    animal === 'hamster'
      ? '공격적인 투자로 볼이 빵빵해진 햄스터입니다. 세상이 두렵지 않아 보기보다 사납습니다.'
      : animal === 'rabbit'
      ? '세상물정 모르는 귀엽고 순수한 토끼입니다. 위협을 피해 합리적인 투자를 합니다.'
      : animal === 'cat'
      ? '겉으로는 귀여워 보이지만, 자기만의 철학적인 주식 투자를 하기 시작했습니다.'
      : animal === 'dog'
      ? '시장과 군중에 대해 잘 파악하고, 활발하게 트렌드를 잘 따라갈 수 있습니다. 많이 사랑받습니다.'
      : animal === 'wolf'
      ? '도전적으로 시장을 주도해 나가기 시작하는 주식 리더입니다. 트렌트를 만들어 나갑니다.'
      : animal === 'tiger'
      ? '전략적으로 주식 리더들을 통솔하여 주식 시장을 이끌어 나갑니다. 카리스마가 넘칩니다.'
      : '전설적인 주식 투자의 신입니다. 부와 권력으로 시장을 휩쓸고 다니며 인품이 훌륭합니다.';

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
