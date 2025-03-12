import { useEffect, useRef, useState } from 'react';
import { Response } from 'shared~type-stock';
import { getFormattedGameTime } from '../utils/stock';

interface Props {
  stock?: Response.GetStock;
  refetch: () => void;
}

/**
 * 게임 시간을 추적하고 매 초마다 업데이트하는 커스텀 훅
 *
 * 이 훅은 다음과 같은 기능을 제공합니다:
 * 1. 게임 시작 시간부터 현재까지의 경과 시간을 'MM:SS' 형식으로 계산
 * 2. 1초마다 경과 시간 업데이트
 * 3. 분(minute)이 변경될 때마다 refetch 함수 호출
 *
 * @param {Object} params - 파라미터 객체
 * @param {Response.GetStock} [params.stock] - 주식 정보 객체 (startedTime 속성 포함)
 * @param {Function} params.refetch - 분이 변경될 때 호출할 데이터 리페치 함수
 * @returns {{gameTime: string}} 현재 게임 시간을 'MM:SS' 형식의 문자열로 반환
 *
 * @example
 * // 컴포넌트 내에서 사용 예시
 * const StockGame = ({ stockId }) => {
 *   const { data: stock, refetch } = useQueryStock(stockId);
 *   const { gameTime } = useTimeRaceCheck({ stock, refetch });
 *
 *   return (
 *     <div>
 *       <h2>게임 진행 시간: {gameTime}</h2>
 *       {children}
 *     </div>
 *   );
 * };
 */

const useTimeRaceCheck = ({ stock, refetch }: Props): { gameTime: string } => {
  const [gameTime, setGameTime] = useState(getFormattedGameTime(stock?.startedTime));
  const gameTimeRef = useRef<string>(gameTime);

  useEffect(() => {
    if (!stock?.startedTime) return () => {};

    const interval = setInterval(() => {
      const newGameTime = getFormattedGameTime(stock.startedTime);

      if (newGameTime !== gameTimeRef.current) {
        const newGameMinute = parseInt(newGameTime.split(':')[0], 10);
        const lastGameMinute = parseInt(gameTimeRef.current.split(':')[0], 10);

        gameTimeRef.current = newGameTime;
        setGameTime(newGameTime);

        if (newGameMinute !== lastGameMinute) {
          refetch();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stock?.startedTime, refetch]);

  return { gameTime };
};

export default useTimeRaceCheck;
