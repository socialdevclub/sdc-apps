import { useNavigate, useLocation } from 'react-router-dom';
import { commaizeNumber } from '@toss/utils';
import { colorDown, colorUp } from '../../../../../../../../config/color';
import StockInfoBox from './StockInfoBox';
import { TitleWrapper, LeftSection, H3, H6Wrapper, H6, H5, H4, FutureInfoWrapper } from '../Home.styles';

interface FutureInfoSectionProps {
  myInfos: { company: string; timeIdx: number; price: number }[];
  futureInfos: { company: string; timeIdx: number; price: number }[];
  gameTimeInMinutes: number;
  fluctuationsInterval: number;
}

const FutureInfoSection = ({
  myInfos,
  futureInfos,
  gameTimeInMinutes,
  fluctuationsInterval,
}: FutureInfoSectionProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = () => {
    const params = new URLSearchParams(location.search);
    params.set('page', '정보');
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  return (
    <>
      <TitleWrapper>
        <LeftSection>
          <H3>내 예측 정보</H3>
          <H6Wrapper>
            <H6>총 {myInfos.length}개 보유</H6>
          </H6Wrapper>
        </LeftSection>
        <H5 onClick={handlePageChange}>전체보기 &gt;</H5>
      </TitleWrapper>
      {futureInfos.length === 0 ? (
        <H4>현재 시각 이후의 정보가 없습니다</H4>
      ) : (
        <H4>현재 시각 이후의 정보 최대 2개가 표시됩니다</H4>
      )}
      <FutureInfoWrapper>
        {futureInfos.slice(0, 2).map(({ company, price, timeIdx }) => {
          const infoTimeInMinutes = timeIdx * fluctuationsInterval;
          const remainingTime = infoTimeInMinutes - gameTimeInMinutes;

          return (
            <StockInfoBox
              key={`${company}_${timeIdx}`}
              title={company}
              value={`${price >= 0 ? '▲' : '▼'}${commaizeNumber(Math.abs(price))}`}
              valueColor={price >= 0 ? colorUp : colorDown}
              remainingTime={remainingTime}
              changeTime={timeIdx * fluctuationsInterval}
            />
          );
        })}
      </FutureInfoWrapper>
    </>
  );
};

export default FutureInfoSection;
