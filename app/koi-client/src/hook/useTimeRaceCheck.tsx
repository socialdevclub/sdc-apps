import { useEffect, useRef, useState } from 'react';
import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import { Response } from 'shared~type-stock';
import prependZero from '../service/prependZero';

const getFormattedGameTime = (startTime?: string): string => {
  if (!startTime) return '00:00';

  return `${prependZero(getDateDistance(dayjs(startTime).toDate(), new Date()).minutes, 2)}:${prependZero(
    getDateDistance(dayjs(startTime).toDate(), new Date()).seconds,
    2,
  )}`;
};

interface Props {
  stock?: Response.GetStock;
  refetch: () => void;
}

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
