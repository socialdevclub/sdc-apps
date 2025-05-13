import styled from '@emotion/styled';

/**
 * RemainTimeClock 컴포넌트 Props 정의
 */
interface RemainTimeClockProps {
  totalTime: number; // 전체 시간 (초 단위)
  remainingTime: number; // 남은 시간 (초 단위)
  size?: string; // 타이머 크기 (CSS 크기 단위, 예: '3rem', '50px' 등)
  // criticalThreshold prop은 제거되고, 남은 시간 10초 기준으로 criticalColor가 적용됩니다.
  primaryColor?: string; // 남은 시간 표시 색상 (기본값: '#9333ea')
  criticalColor?: string; // 남은 시간이 10초 이하일 때의 남은 시간 표시 색상 (기본값: '#EF4444')
  textColor?: string; // 텍스트 색상 (기본값: 'white')
  progressTrackColor?: string; // 프로그레스 바의 *경과된 시간* 트랙 색상 (기본값: '#374151')
  innerCircleColor?: string; // 내부 원 배경색 (기본값: '#030711')
  progressThickness?: string; // 프로그레스 바 두께 (기본값: '6px')
}

/**
 * 남은 시간을 시각적으로 표시하는 원형 타이머 컴포넌트
 *
 * 이 컴포넌트는 전체 시간과 남은 시간을 받아 원형 타이머로 표시합니다.
 * 남은 시간이 10초 이하로 도달하면 타이머의 남은 시간 부분 색상이 변경됩니다.
 *
 * @example
 * // 기본 사용법 (5분 중 3분 경과한 상태 -> 남은 시간 2분)
 * <RemainTimeClock totalTime={300} remainingTime={120} />
 *
 * @example
 * // 사용자 지정 색상, 크기, 두께 등 (남은 시간이 9초이므로 criticalColor 적용)
 * <RemainTimeClock
 *   totalTime={600}
 *   remainingTime={9}
 *   size="4rem"
 *   primaryColor="#4C1D95"        // 일반 남은 시간 색상
 *   criticalColor="#B91C1C"     // 10초 이하일 때 남은 시간 색상
 *   progressTrackColor="#4B5563"  // 경과 시간 색상
 *   innerCircleColor="#111827"
 *   progressThickness="8px"
 * />
 */
const RemainTimeClock = ({
  totalTime,
  remainingTime,
  size = '3rem',
  // primaryColor의 기본값을 주석과 일치하도록 수정 (보라색 계열)
  primaryColor = '#9333ea',
  criticalColor = '#EF4444',
  textColor = 'white',
  // progressTrackColor의 기본값을 주석과 일치하도록 수정 (회색 계열)
  progressTrackColor = '#030711',
  innerCircleColor = 'transparent',
  progressThickness = '6px',
}: RemainTimeClockProps) => {
  const elapsedTime = Math.max(0, totalTime - remainingTime);
  // progress: 0 (시작) ~ 1 (완료)
  const progress = totalTime > 0 ? Math.min(1, elapsedTime / totalTime) : 0;
  // isAlmostFinished: 남은 시간이 10초 이하일 때 true
  const isAlmostFinished = remainingTime <= 10;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  return (
    <Container
      progress={progress}
      isAlmostFinished={isAlmostFinished}
      size={size}
      primaryColor={primaryColor} // 남은 시간의 기본 색상
      criticalColor={criticalColor} // 남은 시간이 10초 이하일 때의 색상
      progressTrackColor={progressTrackColor} // 경과 시간의 색상
    >
      <InnerCircle size={size} thickness={progressThickness} bgColor={innerCircleColor}>
        <TimeText size={size} textColor={textColor}>
          {formatTime(remainingTime)}
        </TimeText>
      </InnerCircle>
    </Container>
  );
};

/**
 * 컨테이너 스타일 Props
 */
interface ContainerStyleProps {
  progress: number;
  isAlmostFinished: boolean;
  size: string;
  primaryColor: string; // 남은 시간 표시 색상
  criticalColor: string; // 남은 시간이 임계값 이하일 때의 남은 시간 표시 색상
  progressTrackColor: string; // 경과 시간 표시 색상
}

/**
 * 메인 컨테이너 스타일 (프로그레스 링)
 */
const Container = styled.div<ContainerStyleProps>`
  width: ${(props) => props.size};
  height: ${(props) => props.size};
  border-radius: 50%;
  /* border-color: #1d283a; // 이 border는 conic-gradient에 의해 덮이므로, 의도와 다를 수 있습니다. */
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: conic-gradient(
    from 0deg,
    /* 12시 방향에서 시작 */ /* 경과된 시간 부분 */ ${(props) => props.progressTrackColor}
      ${(props) => props.progress * 360}deg,
    /* 남은 시간 부분 */ ${(props) => (props.isAlmostFinished ? props.criticalColor : props.primaryColor)}
      ${(props) => props.progress * 360}deg /* 이 지점부터 360deg까지 남은 시간으로 채움 */
  );
`;

/**
 * 내부 원 스타일 Props
 */
interface InnerCircleProps {
  size: string;
  thickness: string;
  bgColor: string;
}

/**
 * 내부 원 스타일 (텍스트 배경)
 */
const InnerCircle = styled.div<InnerCircleProps>`
  width: calc(${(props) => props.size} - (2 * ${(props) => props.thickness}));
  height: calc(${(props) => props.size} - (2 * ${(props) => props.thickness}));
  background-color: ${(props) => props.bgColor};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

/**
 * 시간 텍스트 스타일 Props
 */
interface TimeTextProps {
  size: string;
  textColor: string;
}

/**
 * 시간 텍스트 스타일
 */
const TimeText = styled.span<TimeTextProps>`
  color: ${(props) => props.textColor};
  font-weight: bold;
  font-size: ${(props) => {
    const match = props.size.match(/^(\d*\.?\d+)(\D+)$/);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2];
      return `${value * 0.3}${unit}`;
    }
    return '1rem';
  }};
  text-align: center;
  line-height: 1;
`;

export default RemainTimeClock;
