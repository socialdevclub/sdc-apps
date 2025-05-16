import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from '@emotion/styled';
import useRoundTimeRaceCheck from '../../../../../../../../hook/useRoundTimeRaceCheck.tsx';
import { useQueryParty } from '../../../../../../../../hook/query/Party';
import { useQueryStock } from '../../../../../../../../hook/query/Stock';
import Card from '../../../../../../../../component-presentation/Card.tsx';
import { secondsToMMSS } from '../../../../../../../../utils/stock.ts';
import * as COLOR from '../../../../../../../../config/color.ts';

const TimeIndicator = () => {
  const { partyId } = useParams();
  const { data: party } = useQueryParty(partyId ?? '');
  const { data: stock, refetch } = useQueryStock(party?.activityName ?? '');

  const { remainingTime, roundTime, elapsedTime, round } = useRoundTimeRaceCheck({ refetch, stock });

  return (
    <Card
      title="경과 시간"
      value={secondsToMMSS(elapsedTime)}
      rightComponent={<ProgressBar roundTime={roundTime} elapsedTime={elapsedTime} round={round} />}
    />
  );
};

export default TimeIndicator;

interface ProgressBarProps {
  roundTime: number;
  elapsedTime: number;
  round?: number;
}

function ProgressBar({ roundTime, elapsedTime, round }: ProgressBarProps) {
  // 진행률 계산 (0-100%)
  const percentage = useMemo((): number => {
    // 전체 시간이 0이면 0% 반환
    if (roundTime <= 0) return 0;

    // 경과 시간이 전체 시간을 초과하지 않도록 제한
    const clampedElapsedTime = Math.min(elapsedTime, roundTime);

    // 진행률 계산 및 소수점 첫째 자리까지 반올림
    return Math.round((clampedElapsedTime / roundTime) * 100 * 10) / 10;
  }, [roundTime, elapsedTime]);

  return (
    <ProgressBarWrapper>
      <RoundIndicator>{round ?? 0}ROUND</RoundIndicator>
      <ProgressBarContainer>
        <ProgressFill percentage={percentage} />
        {/* 8개의 세로 구분선 (9칸으로 나누기) */}
        {Array.from({ length: 8 }).map((_, index) => {
          // 1/9부터 8/9까지의 위치에 구분선 배치 (시작점과 끝점 제외)
          const position = ((index + 1) / 9) * 100;
          return <VerticalDivider key={position} position={position} />;
        })}
      </ProgressBarContainer>
    </ProgressBarWrapper>
  );
}

// 세로 구분선 컴포넌트 타입 정의
interface VerticalDividerProps {
  position: number;
}

// 진행 바 채우기 타입 정의
interface ProgressFillProps {
  percentage: number;
  color?: string;
}

// 세로 구분선 컴포넌트
const VerticalDivider = styled.div<VerticalDividerProps>`
  position: absolute;
  top: -4px;
  left: ${(props: VerticalDividerProps) => props.position}%;
  width: 2px;
  height: 0.8rem; /* Increased height */
  background-color: #000000;
  z-index: 5;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 2px;
    background-color: #000000;
  }

  &::before {
    top: -0.1rem;
    height: 0.1rem;
  }

  &::after {
    bottom: -0.1rem;
    height: 0.1rem;
  }
`;

const ProgressBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 75%;
  padding-left: 20px;
  height: 44px; /* Match Card's content height (22px title + 22px value) */
  position: relative;
  gap: 0.6rem;
`;

// 진행 바 컨테이너 스타일링
const ProgressBarContainer = styled.div`
  width: 100%;
  height: 4px;
  background-color: #000000;
  border-radius: 5px;
  overflow: visible; /* Changed back to visible for dividers */
  position: relative;
`;

// 진행 바 내부 채우기 스타일링
const ProgressFill = styled.div<ProgressFillProps>`
  height: 100%;
  background-color: ${(props: ProgressFillProps) => props.color || COLOR.violet};
  width: ${(props: ProgressFillProps) => Math.min(props.percentage, 100)}%; /* Ensure percentage doesn't exceed 100% */
  border-radius: 5px;
  transition: width 0.3s ease;
  position: relative;
  z-index: 1;
`;

const RoundIndicator = styled.div`
  background-color: ${COLOR.green}33; /* 33 is 20% opacity in hex */
  font-weight: bold;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  letter-spacing: 0.5px;
  line-height: 16px;
  color: ${COLOR.pastelGreen};
  transform: translateY(-15%);
`;
