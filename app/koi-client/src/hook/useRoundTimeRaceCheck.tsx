import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Response } from 'shared~type-stock';

interface Props {
  stock?: Response.GetStock;
  refetch: () => void;
}

/**
 * 라운드 시간을 추적하고 매 초마다 업데이트하는 커스텀 훅 (성능 최적화 버전)
 *
 *
 * @param {Object} params - 파라미터 객체
 * @param {Response.GetStock} [params.stock] - 주식 정보 객체 (startedTime 및 fluctuationsInterval 속성 포함)
 *                                             fluctuationsInterval은 분 단위의 라운드 시간입니다.
 * @param {Function} params.refetch - 분이 변경될 때 호출할 데이터 리페치 함수
 * @returns {{elapsedTime: number, remainingTime: number, roundTime: number}} 경과 시간, 남은 시간 및 라운드 총 시간을 초 단위 숫자로 반환
 *
 * @example
 * // 기본 사용법 - stock.fluctuationsInterval에서 라운드 시간을 가져옴
 * const GameTimer = () => {
 *   const { data: stock, refetch } = useQueryStock(stockId);
 *   const { elapsedTime, remainingTime, roundTime } = useRoundTimeRaceCheck({
 *     stock,
 *     refetch
 *   });
 *
 *   return (
 *     <div>
 *       <p>경과 시간: {elapsedTime}초</p>
 *       <p>남은 시간: {remainingTime}초</p>
 *       <p>전체 시간: {roundTime}초</p>
 *     </div>
 *   );
 * };
 *
 * @example
 * // 타이머 기반 경고 및 알림 구현
 * const StockTimerWithAlerts = () => {
 *   const { data: stock, refetch } = useQueryStock(stockId);
 *   const { elapsedTime, remainingTime, roundTime } = useRoundTimeRaceCheck({
 *     stock,
 *     refetch
 *   });
 *
 *   // 남은 시간에 따른 경고 메시지 표시
 *   let alertMessage = null;
 *   if (remainingTime <= 60 && remainingTime > 30) {
 *     alertMessage = "라운드 종료 1분 전입니다!";
 *   } else if (remainingTime <= 30 && remainingTime > 0) {
 *     alertMessage = "라운드 종료 30초 전! 최종 결정을 내리세요!";
 *   } else if (remainingTime === 0) {
 *     alertMessage = "라운드가 종료되었습니다!";
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

  // 라운드 시간을 초 단위로 계산 (기본값 5분 = 300초)
  const roundTimeInSeconds = useMemo(() => {
    return stock?.fluctuationsInterval ? stock.fluctuationsInterval * 60 : 300;
  }, [stock?.fluctuationsInterval]);

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
        const isRoundFinished = newElapsedSeconds >= roundTimeInSeconds;

        // 라운드가 끝났거나 새로운 시간이 있을 때만 업데이트
        if (isRoundFinished) {
          if (state.elapsedTime !== roundTimeInSeconds) {
            dispatch({ payload: { elapsedSeconds: roundTimeInSeconds }, type: 'UPDATE_TIME' });
          }
        } else if (newElapsedSeconds !== state.elapsedTime) {
          dispatch({ payload: { elapsedSeconds: newElapsedSeconds }, type: 'UPDATE_TIME' });

          // 분이 변경되었는지 확인
          const currentMinute = Math.floor(newElapsedSeconds / 60);
          if (currentMinute !== prevMinuteRef.current) {
            prevMinuteRef.current = currentMinute;
            refetch();
          }
        }

        lastUpdateTimeRef.current = timestamp;
      }

      // 타이머가 완료되지 않았으면 계속 실행
      if (state.elapsedTime < roundTimeInSeconds) {
        frameIdRef.current = requestAnimationFrame((newTimestamp) => updateTimer(newTimestamp, startTime));
      }
    },
    [state.elapsedTime, roundTimeInSeconds, calculateElapsedSeconds, refetch],
  );

  // 타이머 시작/정지 이펙트
  useEffect(() => {
    // 타이머 초기화 및 종료
    if (!stock?.startedTime) {
      dispatch({ type: 'RESET' });
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

  // 결과 반환 - roundTime도 추가해서 반환
  return {
    elapsedTime: state.elapsedTime,
    remainingTime,
    roundTime: roundTimeInSeconds,
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
