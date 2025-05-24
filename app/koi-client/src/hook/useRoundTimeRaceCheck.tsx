import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { Response } from 'shared~type-stock';

interface Props {
  stock?: Response.GetStock;
  refetch: () => void;
}

// 타이머 상태 타입
type TimerState = {
  elapsedTime: number; // 현재 라운드 내 경과 시간
  // lastMinute은 이제 prevMinuteRef로 관리되므로 상태에서 제거 가능
};

// 타이머 액션 타입
type TimerAction = { type: 'UPDATE_TIME'; payload: { elapsedSeconds: number } } | { type: 'RESET' };

// 초기 타이머 상태
const initialTimerState: TimerState = {
  elapsedTime: 0,
};

/**
 * 타이머 상태를 관리하는 리듀서 함수
 *
 * @param state 현재 타이머 상태
 * @param action 타이머 상태 업데이트 액션 (UPDATE_TIME 또는 RESET)
 * @returns 새로운 타이머 상태
 */
function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'UPDATE_TIME': {
      const { elapsedSeconds } = action.payload;
      if (state.elapsedTime === elapsedSeconds) {
        return state; // 변경 없으면 새 객체 생성 방지
      }
      return { elapsedTime: elapsedSeconds };
    }
    case 'RESET':
      if (state.elapsedTime === 0) return state;
      return { ...initialTimerState };
    default:
      return state;
  }
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
 * // 타이머 컴포넌트와 함께 사용
 * const RoundTimerDisplay = () => {
 *   const { data: stock, refetch } = useQueryStock(stockId);
 *   const {
 *     elapsedTime,
 *     remainingTime,
 *     roundTime,
 *     currentRound,
 *     totalRounds,
 *     totalElapsedTime,
 *     isCompleted
 *   } = useRoundTimeRaceCheck({
 *     stock,
 *     refetch
 *   });
 *
 *   // 전체 진행률 계산 (0-100%)
 *   const totalProgress = Math.min(100,
 *     (totalElapsedTime / (roundTime * totalRounds)) * 100
 *   );
 *
 *   return (
 *     <div>
 *       <ProgressBar
 *         progress={totalProgress}
 *         segments={totalRounds}
 *         currentSegment={currentRound}
 *       />
 *       <div>라운드 {currentRound}/{totalRounds}</div>
 *       <div>남은 시간: {formatTime(remainingTime)}</div>
 *       {isCompleted && <div>모든 라운드가 종료되었습니다!</div>}
 *     </div>
 *   );
 * };
 *
 * @example
 * // 라운드 변경 알림 구현
 * const RoundNotification = () => {
 *   const { data: stock, refetch } = useQueryStock(stockId);
 *   const {
 *     currentRound,
 *     totalRounds,
 *     isLastRound,
 *     remainingTime
 *   } = useRoundTimeRaceCheck({
 *     stock,
 *     refetch
 *   });
 *
 *   // 이전 라운드 번호 추적
 *   const prevRoundRef = useRef(currentRound);
 *
 *   useEffect(() => {
 *     // 라운드가 변경되었을 때 알림 표시
 *     if (currentRound !== prevRoundRef.current) {
 *       if (currentRound > prevRoundRef.current) {
 *         showNotification(`라운드 ${currentRound} 시작!`);
 *       }
 *       prevRoundRef.current = currentRound;
 *     }
 *
 *     // 남은 시간이 30초 이하일 때 경고 표시
 *     if (remainingTime <= 30 && remainingTime > 0 && isLastRound) {
 *       showWarning(`마지막 라운드 종료 ${remainingTime}초 전!`);
 *     }
 *   }, [currentRound, remainingTime, isLastRound]);
 *
 *   return null; // 이 컴포넌트는 UI를 렌더링하지 않음
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
  // 현재 라운드 인덱스 추적 (0-based index)
  const currentRoundRef = useRef(0); // 0-based index로 라운드를 추적하거나, 완료 시 totalRounds 값을 가짐
  // 전체 경과 시간 추적
  const totalElapsedTimeRef = useRef(0);

  // 라운드 시간을 초 단위로 계산 (기본값 5분 = 300초)
  const roundTimeInSeconds = useMemo(() => {
    return stock?.fluctuationsInterval ? stock.fluctuationsInterval * 60 : 300;
  }, [stock?.fluctuationsInterval]);

  // 총 라운드 수 계산 (round가 0이면 9, 아니면 입력된 값)
  const totalRounds = useMemo(() => {
    // JSDoc에 따라: stock.round가 0이면 9, 아니면 해당 값. stock.round가 없으면 9라운드.
    // 또는 1라운드가 최소값이 되도록 하려면 (stock?.round === 0 ? 9 : stock?.round || 1)
    // 여기서는 JSDoc을 우선하여 `|| 9` 사용.
    return stock?.round === 0 ? 9 : stock?.round || 9;
  }, [stock?.round]);

  /**
   * 시작 시간부터 현재까지의 총 경과 시간을 초 단위로 계산
   * @param startTime 시작 시간 타임스탬프 (밀리초)
   * @returns 경과 시간 (초)
   */
  const calculateTotalElapsedSeconds = useCallback((startTime: number): number => {
    const now = new Date().getTime();
    const elapsedMs = now - startTime;
    return Math.max(0, Math.floor(elapsedMs / 1000));
  }, []);

  /**
   * 타이머 업데이트 함수 - 애니메이션 프레임 기반으로 실행
   * @param timestamp 현재 애니메이션 프레임 타임스탬프
   * @param startTime 타이머 시작 시간 타임스탬프
   */
  const updateTimer = useCallback(
    (timestamp: number, startTime: number) => {
      // 이미 취소된, 정리해야 하는 애니메이션 프레임인 경우 즉시 반환
      if (frameIdRef.current === null) return;

      // 약 1초마다 업데이트 (또는 초기 실행)
      if (timestamp - lastUpdateTimeRef.current >= 980 || lastUpdateTimeRef.current === 0) {
        // 총 경과 시간 계산 및 저장
        const newTotalElapsedSeconds = calculateTotalElapsedSeconds(startTime);
        totalElapsedTimeRef.current = newTotalElapsedSeconds;

        // 완료된 라운드 수 계산
        const completedRoundsCount = Math.floor(newTotalElapsedSeconds / roundTimeInSeconds);

        if (completedRoundsCount >= totalRounds) {
          // 모든 라운드 완료
          // currentRoundRef는 마지막 라운드 인덱스 (totalRounds - 1) 또는 totalRounds 값 자체로 설정될 수 있음.
          // 여기서는 JSDoc과 기존 로직을 따라 totalRounds 값으로 설정.
          // 이렇게 하면 currentRound 계산 시 Math.min(totalRounds + 1, totalRounds) = totalRounds가 됨.
          if (currentRoundRef.current !== totalRounds || state.elapsedTime !== roundTimeInSeconds) {
            currentRoundRef.current = totalRounds; // 이 값은 currentRound 계산에 직접 사용
            // 마지막 라운드가 꽉 찬 상태로 보이도록 elapsedTime을 roundTimeInSeconds로 설정
            dispatch({ payload: { elapsedSeconds: roundTimeInSeconds }, type: 'UPDATE_TIME' });
          }

          // 더 이상 타이머 업데이트 중단
          if (frameIdRef.current !== null) {
            cancelAnimationFrame(frameIdRef.current);
            frameIdRef.current = null;
          }
          return;
        }

        // 현재 라운드 내 경과 시간 계산
        const elapsedSecondsInCurrentRound = newTotalElapsedSeconds % roundTimeInSeconds;
        const newCurrentRoundIndex = completedRoundsCount; // 0-based index

        // 라운드가 변경되었는지 확인
        if (currentRoundRef.current !== newCurrentRoundIndex) {
          currentRoundRef.current = newCurrentRoundIndex;
          prevMinuteRef.current = -1; // 새 라운드 시작 시 분 변경 감지 초기화
        }

        // 현재 라운드 내 경과 시간이 변경되었을 때만 업데이트
        if (elapsedSecondsInCurrentRound !== state.elapsedTime) {
          dispatch({ payload: { elapsedSeconds: elapsedSecondsInCurrentRound }, type: 'UPDATE_TIME' });
        }

        // 분이 변경되었는지 확인
        const currentMinuteInRound = Math.floor(elapsedSecondsInCurrentRound / 60);
        if (currentMinuteInRound !== prevMinuteRef.current) {
          prevMinuteRef.current = currentMinuteInRound;
          if (stock?.startedTime) {
            // 타이머가 유효하게 동작 중일 때만 refetch
            refetch();
          }
        }
        lastUpdateTimeRef.current = timestamp;
      }

      // 다음 애니메이션 프레임 요청
      if (frameIdRef.current !== null) {
        frameIdRef.current = requestAnimationFrame((newTimestamp) => updateTimer(newTimestamp, startTime));
      }
    },
    // state.elapsedTime 의존성 제거 (dispatch는 안정적이므로, state 직접 참조 대신 함수형 업데이트 고려 가능하나 여기서는 유지)
    [calculateTotalElapsedSeconds, roundTimeInSeconds, totalRounds, refetch, stock?.startedTime, state.elapsedTime],
  );

  // 타이머 시작/정지/초기화 이펙트
  useEffect(() => {
    // 유효하지 않은 stock 데이터인 경우 타이머 초기화
    if (!stock || !stock.startedTime || totalRounds <= 0 || roundTimeInSeconds <= 0) {
      dispatch({ type: 'RESET' });
      prevMinuteRef.current = -1;
      currentRoundRef.current = 0; // 초기 라운드 인덱스 (0-based)
      totalElapsedTimeRef.current = 0;
      lastUpdateTimeRef.current = 0;
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      return;
    }

    // 시작 시간 설정 및 초기 상태 계산
    const startTime = new Date(stock.startedTime).getTime();
    lastUpdateTimeRef.current = 0;

    // 초기 상태 계산
    const initialTotalElapsedSeconds = calculateTotalElapsedSeconds(startTime);
    totalElapsedTimeRef.current = initialTotalElapsedSeconds;
    const initialCompletedRounds = Math.floor(initialTotalElapsedSeconds / roundTimeInSeconds);

    if (initialCompletedRounds >= totalRounds) {
      // 이미 모든 라운드가 완료된 상태
      currentRoundRef.current = totalRounds; // 완료 상태의 currentRoundRef 값
      dispatch({ payload: { elapsedSeconds: roundTimeInSeconds }, type: 'UPDATE_TIME' });
    } else {
      // 진행 중인 상태
      currentRoundRef.current = initialCompletedRounds; // 0-based index
      const initialElapsedSecondsInCurrentRound = initialTotalElapsedSeconds % roundTimeInSeconds;
      dispatch({ payload: { elapsedSeconds: initialElapsedSecondsInCurrentRound }, type: 'UPDATE_TIME' });

      prevMinuteRef.current = Math.floor(initialElapsedSecondsInCurrentRound / 60);
      // if (stock.startedTime) { refetch(); } // 초기 로드 시 refetch 필요시

      // 기존 타이머가 있으면 정리 후 새 타이머 시작
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      frameIdRef.current = requestAnimationFrame((timestamp) => updateTimer(timestamp, startTime));
    }

    // 정리 함수 - 컴포넌트 언마운트 또는 의존성 변경 시 호출
    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
  }, [stock, roundTimeInSeconds, totalRounds, calculateTotalElapsedSeconds, updateTimer, refetch]); // updateTimer 의존성 추가

  // 모든 라운드가 완료되었는지 여부
  const isCompleted = useMemo(() => {
    if (totalRounds <= 0 || roundTimeInSeconds <= 0) return false;
    // totalElapsedTimeRef.current가 상태 변경을 직접 트리거하지 않으므로, state.elapsedTime과 currentRoundRef를 통해 간접적으로 변경 감지
    return totalElapsedTimeRef.current >= totalRounds * roundTimeInSeconds;
  }, [totalRounds, roundTimeInSeconds, state.elapsedTime]); // state.elapsedTime 추가로 재계산 유도

  // 현재 라운드 번호 계산 (1부터 시작)
  const currentRound = useMemo(() => {
    if (totalRounds <= 0) return 1; // 방어 로직

    // 모든 라운드가 완료된 경우 마지막 라운드 번호 반환
    if (isCompleted) {
      return totalRounds;
    }

    // currentRoundRef.current는 진행 중일 때는 0-based index,
    // 완료 직전 updateTimer에서 totalRounds 값으로 설정될 수 있음.
    // Math.min(currentRoundRef.current + 1, totalRounds)는
    // currentRoundRef.current가 0-based index일 때 (index + 1)을 현재 라운드로,
    // currentRoundRef.current가 totalRounds일 때 (totalRounds + 1)과 totalRounds 중 작은 값, 즉 totalRounds를 반환.
    // 이 로직은 isCompleted 조건으로 이미 커버될 수 있으나, 이중 안전장치로 둠.
    // state.elapsedTime 변경 시 currentRoundRef.current의 최신값을 반영하여 재계산.
    return Math.min(currentRoundRef.current + 1, totalRounds);
  }, [totalRounds, state.elapsedTime, isCompleted]); // 의존성에 state.elapsedTime 과 isCompleted 추가

  // 현재 라운드 내 남은 시간 계산
  const remainingTime = useMemo(() => {
    if (isCompleted) return 0;
    return Math.max(0, roundTimeInSeconds - state.elapsedTime);
  }, [roundTimeInSeconds, state.elapsedTime, isCompleted]);

  // 현재 마지막 라운드인지 여부 (완료되지 않은 상태의 마지막 라운드)
  const isLastRound = useMemo(() => {
    if (totalRounds <= 0) return false;
    return currentRound === totalRounds && !isCompleted; // 아직 완료되지 않은 마지막 라운드
  }, [currentRound, totalRounds, isCompleted]);

  // 훅의 반환값 - 타이머 상태 및 계산된 메타데이터
  return {
    // 라운드 총 시간 (초)
    currentRound,

    elapsedTime: state.elapsedTime,

    // 전체 경과 시간 (초)
    isCompleted,

    // 총 라운드 수
    isLastRound,

    // 현재 라운드 내 경과 시간 (초)
    remainingTime,

    // 현재 라운드 내 남은 시간 (초)
    roundTime: roundTimeInSeconds,

    // 마지막 라운드 여부
    totalElapsedTime: totalElapsedTimeRef.current,

    // 현재 라운드 번호 (1부터 시작)
    totalRounds, // 모든 라운드 완료 여부
  };
};

export default useRoundTimeRaceCheck;
