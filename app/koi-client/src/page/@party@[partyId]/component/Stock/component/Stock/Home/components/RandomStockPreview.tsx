import { css } from '@emotion/react';
import { useAtomValue } from 'jotai';
import { memo } from 'react';
import { UserStore } from '../../../../../../../../store';
import { getAnimalImageSource } from '../../../../../../../../utils/stock';
import { H3, H4, LeftSection, TitleWrapper, Wrapper } from '../Home.styles';
import { useRandomStockPreview } from '../hooks/useRandomStockPreview';
import { useStockInfo } from '../hooks/useStockInfo';
import StockInfoBox from './StockInfoBox';

interface Props {
  stockId: string;
  onClick?: (company: string) => void;
}

const RandomStockPreview = ({ stockId, onClick }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  // 공통 훅 사용
  const { stock, gameTimeInMinutes, timeIdx } = useStockInfo(stockId);

  // 랜덤 주식 예측 정보 훅 사용
  const { nextRoundPredict } = useRandomStockPreview(stockId, userId, timeIdx, stock);

  if (!stock) {
    return <div>불러오는 중.</div>;
  }

  if (!nextRoundPredict) {
    return null;
  }

  const infoTimeInMinutes = nextRoundPredict.predictTime;
  const remainingTime = infoTimeInMinutes - gameTimeInMinutes;

  return (
    <Wrapper>
      <TitleWrapper>
        <LeftSection>
          <H3>오를락 내릴락 라일락 💜🫧</H3>
        </LeftSection>
      </TitleWrapper>
      <H4>가격이 오를지 내릴지는 운에 맡겨보세요!</H4>
      <StockInfoBox
        key={nextRoundPredict.companyName.slice(0, 4)}
        title={nextRoundPredict.companyName.slice(0, 4)}
        src={getAnimalImageSource(nextRoundPredict.companyName)}
        value={
          <div
            css={css`
              display: flex;
              align-items: center;
              gap: 8px;
            `}
          >
            <img src="/assets/li_trending-up-down.svg" alt="랜덤 주식 정보" />
            {Intl.NumberFormat().format(nextRoundPredict.priceVariation)}
          </div>
        }
        valueColor="#c6c6c6"
        remainingTime={remainingTime}
        changeTime={`${nextRoundPredict.predictTime}:00`}
        onClick={() => onClick?.(nextRoundPredict.companyName)}
      />
    </Wrapper>
  );
};

export default memo(RandomStockPreview);
