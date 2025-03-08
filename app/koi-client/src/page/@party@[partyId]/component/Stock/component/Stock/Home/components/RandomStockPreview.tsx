import { useAtomValue } from 'jotai';
import { memo } from 'react';
import { UserStore } from '../../../../../../../../store';
import { useStockInfo } from '../hooks/useStockInfo';
import { useRandomStockPreview } from '../hooks/useRandomStockPreview';
import StockInfoBox from './StockInfoBox';
import { Wrapper, TitleWrapper, LeftSection, H3, H4 } from '../Home.styles';

interface Props {
  stockId: string;
}

const RandomStockPreview = ({ stockId }: Props) => {
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
      <H4>현재 시각 이후의 정보 최대 2개가 표시됩니다</H4>

      <StockInfoBox
        key={`${nextRoundPredict.companyName}`}
        title={nextRoundPredict.companyName}
        value={`${Intl.NumberFormat().format(nextRoundPredict.priceVariation)}`}
        valueColor="#c6c6c6"
        remainingTime={remainingTime}
        changeTime={`${nextRoundPredict.predictTime}:00`}
      />
    </Wrapper>
  );
};

export default memo(RandomStockPreview);
