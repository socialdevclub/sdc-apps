import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Response } from 'shared~type-stock';

interface Props {
  stock?: Response.GetStock;
  refetch: () => void;
}

/**
 * 라운드 시간을 추적하고 매 초마다 업데이트하는 커스텀 훅 (성능 최적화 버전)
 *
 * 성능 최적화 전략:
 * - requestAnimationFrame 사용으로 브라우저 렌더링 사이클에 최적화
 * - useReducer를 통한 상태 관리 최적화
 * - useCallback과 useMemo를 통한 불필요한 재계산 방지
 * - 필요한 경우에만 상태 업데이트하는 조건부 업데이트 로직
 *
 * 이 훅은 라운드 시간을 추적하며, 각 라운드가 끝나면 자동으로 다음 라운드로 넘어갑니다.
 * 총 라운드 수가 완료되면 타이머가 멈춥니다.
 *
 * @param {Object} params - 파라미터 객체
 * @param {Response.GetStock} [params.stock] - 주식 정보 객체 (startedTime, fluctuationsInterval, round 속성 포함)
 *                                             fluctuationsInterval은 분 단위의 라운드 시간입니다.
 *                                             round는 총 라운드 수(0인 경우 9라운드)입니다.
 * @param {Function} params.refetch - 분이 변경될 때 호출할 데이터 리페치 함수
 * @returns {{
 *   elapsedTime: number,       // 현재 라운드 내 경과 시간 (초 단위)
 *   remainingTime: number,     // 현재 라운드 내 남은 시간 (초 단위)
 *   roundTime: number,         // 라운드 총 시간 (초 단위)
 *   currentRound: number,      // 현재 라운드 번호 (1부터 시작)
 *   totalRounds: number,       // 총 라운드 수
 *   isLastRound: boolean,      // 마지막 라운드 여부
 *   totalElapsedTime: number,  // 전체 경과 시간 (초 단위)
 *   isCompleted: boolean       // 모든 라운드 완료 여부
 * }} 라운드 타이머 관련 정보
 *
 * @example
 * // 기본 사용법 - stock.fluctuationsInterval에서 라운드 시간을 가져옴
 * const GameTimer = () => {
 *   const { data: stock, refetch } = useQueryStock(stockId);
 *   const {
 *     elapsedTime,
 *     remainingTime,
 *     roundTime,
 *     currentRound,
 *     totalRounds,
 *     isLastRound
 *   } = useRoundTimeRaceCheck({
 *     stock,
 *     refetch
 *   });
 *
 *   return (
 *     <div>
 *       <p>현재 라운드: {currentRound}/{totalRounds}</p>
 *       <p>경과 시간: {elapsedTime}초</p>
 *       <p>남은 시간: {remainingTime}초</p>
 *       <p>라운드 시간: {roundTime}초</p>
 *       {isLastRound && <p>마지막 라운드입니다!</p>}
 *     </div>
 *   );
 * };
 *
 * @example
 * // 타이머 기반 경고 및 알림 구현
 * const StockTimerWithAlerts = () => {
 *   const { data: stock, refetch } = useQueryStock(stockId);
 *   const {
 *     elapsedTime,
 *     remainingTime,
 *     roundTime,
 *     currentRound,
 *     isCompleted
 *   } = useRoundTimeRaceCheck({
 *     stock,
 *     refetch
 *   });
 *
 *   // 남은 시간에 따른 경고 메시지 표시
 *   let alertMessage = null;
 *
 *   if (isCompleted) {
 *     alertMessage = "모든 라운드가 종료되었습니다!";
 *   } else if (remainingTime <= 60 && remainingTime > 30) {
 *     alertMessage = `라운드 ${currentRound} 종료 1분 전입니다!`;
 *   } else if (remainingTime <= 30 && remainingTime > 0) {
 *     alertMessage = `라운드 ${currentRound} 종료 30초 전! 최종 결정을 내리세요!`;
 *   } else if (remainingTime === 0) {
 *     alertMessage = `라운드 ${currentRound}가 종료되었습니다!`;
 *   }
 *
 *   return (
 *     <div>
 *       <TimeIndicator
 *         standardTime={roundTime}
 *         elapsedTime={elapsedTime}
 *         size="4rem"
 *       />
 *       {alertMessage && <div className="alert-message">{alertMessage}</div>}
 *     </div>
 *   );
 * };
 */
const useRoundTimeRaceCheck = ({ stock, refetch }: Props) => {
  // 타이머 상태 관리를 위한 리듀서 사용
  const [state, dispatch] = useReducer(timerReducer, initialTimerState);

  // 분 변경 감지를 위한 ref
  const prevMinuteRef = useRef(-1);

  // 애니메이션 프레임 ID 관리
  const frameIdRef = useRef<number | null>(null);

  // 마지막 업데이트 시간 관리
  const lastUpdateTimeRef = useRef(0);

  // 현재 라운드 번호 추적용 ref
  const currentRoundRef = useRef(0);

  // 전체 경과 시간 추적용 ref
  const totalElapsedTimeRef = useRef(0);

  // 라운드 시간을 초 단위로 계산 (기본값 5분 = 300초)
  const roundTimeInSeconds = useMemo(() => {
    return stock?.fluctuationsInterval ? stock.fluctuationsInterval * 60 : 300;
  }, [stock?.fluctuationsInterval]);

  // 총 라운드 수 계산 (round가 0이면 9, 아니면 입력된 값)
  const totalRounds = useMemo(() => {
    return stock?.round === 0 ? 9 : stock?.round || 9;
  }, [stock?.round]);

  // 경과 시간 계산 함수 메모이제이션
  const calculateElapsedSeconds = useCallback((startTime: number): number => {
    const now = new Date().getTime();
    const elapsedMs = now - startTime;
    return Math.floor(elapsedMs / 1000);
  }, []);

  // 타이머 업데이트 함수 메모이제이션
  const updateTimer = useCallback(
    (timestamp: number, startTime: number) => {
      // 1초마다 업데이트 또는 초기 실행 시
      if (timestamp - lastUpdateTimeRef.current >= 1000 || lastUpdateTimeRef.current === 0) {
        const newElapsedSeconds = calculateElapsedSeconds(startTime);
        totalElapsedTimeRef.current = newElapsedSeconds;

        // 라운드 시간을 초과했는지 확인
        const completedRounds = Math.floor(newElapsedSeconds / roundTimeInSeconds);

        // 이 부분에서 총 라운드 수를 초과했는지 확인
        if (completedRounds >= totalRounds) {
          // 마지막 라운드가 끝났으면 더 이상 업데이트하지 않고 마지막 상태로 고정
          if (state.elapsedTime !== 0 || currentRoundRef.current !== totalRounds) {
            currentRoundRef.current = totalRounds;
            dispatch({ payload: { elapsedSeconds: 0 }, type: 'UPDATE_TIME' });
          }

          // 더 이상 타이머 업데이트 중단 (프레임 요청 취소)
          if (frameIdRef.current !== null) {
            cancelAnimationFrame(frameIdRef.current);
            frameIdRef.current = null;
          }

          return;
        }

        // 현재 라운드 내의 경과 시간 계산
        let adjustedElapsedSeconds = newElapsedSeconds;
        if (newElapsedSeconds >= roundTimeInSeconds) {
          adjustedElapsedSeconds = newElapsedSeconds % roundTimeInSeconds;

          // 라운드가 변경되었는지 확인
          const newRound = completedRounds;
          if (newRound > currentRoundRef.current) {
            currentRoundRef.current = newRound;
            // 라운드가 변경되었을 때 추가 작업이 필요하다면 여기에 코드 추가
          }
        }

        // 경과 시간이 변경되었을 때만 업데이트
        if (adjustedElapsedSeconds !== state.elapsedTime || completedRounds !== currentRoundRef.current) {
          dispatch({ payload: { elapsedSeconds: adjustedElapsedSeconds }, type: 'UPDATE_TIME' });

          // 분이 변경되었는지 확인
          const currentMinute = Math.floor(adjustedElapsedSeconds / 60);
          if (currentMinute !== prevMinuteRef.current) {
            prevMinuteRef.current = currentMinute;
            refetch();
          }
        }

        lastUpdateTimeRef.current = timestamp;
      }

      // 다음 프레임 요청 (frameIdRef가 null이 아닐 때만)
      if (frameIdRef.current !== null) {
        frameIdRef.current = requestAnimationFrame((newTimestamp) => updateTimer(newTimestamp, startTime));
      }
    },
    [state.elapsedTime, roundTimeInSeconds, totalRounds, calculateElapsedSeconds, refetch],
  );

  // 타이머 시작/정지 이펙트
  useEffect(() => {
    // 타이머 초기화 및 종료
    if (!stock?.startedTime) {
      dispatch({ type: 'RESET' });
      currentRoundRef.current = 0;
      totalElapsedTimeRef.current = 0;
      return () => {
        if (frameIdRef.current !== null) {
          cancelAnimationFrame(frameIdRef.current);
          frameIdRef.current = null;
        }
      };
    }

    // 시작 시간 설정
    const startTime = new Date(stock.startedTime).getTime();

    // 기존 타이머가 있으면 정리
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
    }

    // 새 타이머 시작
    frameIdRef.current = requestAnimationFrame((timestamp) => updateTimer(timestamp, startTime));

    // 정리 함수
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [stock?.startedTime, updateTimer]);

  // 남은 시간 계산 메모이제이션
  const remainingTime = useMemo(() => {
    return Math.max(0, roundTimeInSeconds - state.elapsedTime);
  }, [roundTimeInSeconds, state.elapsedTime]);

  // 현재 라운드 번호 계산 (0부터 시작하는 인덱스를 1부터 시작하는 번호로 변환)
  const currentRound = useMemo(() => {
    return Math.min(currentRoundRef.current + 1, totalRounds);
  }, [totalRounds, state.elapsedTime]); // state.elapsedTime을 의존성에 추가하여 업데이트 감지

  // 마지막 라운드인지 확인
  const isLastRound = useMemo(() => {
    return currentRound === totalRounds;
  }, [currentRound, totalRounds]);

  // 모든 라운드가 완료되었는지 확인
  const isCompleted = useMemo(() => {
    return totalElapsedTimeRef.current >= totalRounds * roundTimeInSeconds;
  }, [totalRounds, roundTimeInSeconds, state.elapsedTime]); // state.elapsedTime을 의존성에 추가하여 업데이트 감지

  // 결과 반환 - 라운드 정보 추가
  return {
    currentRound,
    elapsedTime: state.elapsedTime,
    isCompleted,
    isLastRound,
    remainingTime,
    roundTime: roundTimeInSeconds,
    totalElapsedTime: totalElapsedTimeRef.current,
    totalRounds,
  };
};

// 타이머 상태 타입
type TimerState = {
  elapsedTime: number;
  lastMinute: number;
};

// 타이머 액션 타입
type TimerAction = { type: 'UPDATE_TIME'; payload: { elapsedSeconds: number } } | { type: 'RESET' };

// 초기 타이머 상태
const initialTimerState: TimerState = {
  elapsedTime: 0,
  lastMinute: -1,
};

// 타이머 상태 관리 리듀서
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'UPDATE_TIME': {
      const { elapsedSeconds } = action.payload;
      const currentMinute = Math.floor(elapsedSeconds / 60);
      return {
        elapsedTime: elapsedSeconds,
        lastMinute: currentMinute,
      };
    }
    case 'RESET':
      return { ...initialTimerState };
    default:
      return state;
  }
}

export default useRoundTimeRaceCheck;
