import React, { useEffect } from 'react';
import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import { Query } from '../../../../hook';

interface Props {
  children: React.ReactNode;
  stockId: string;
}

const PlayingWrapper = ({ children, stockId }: Props) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const { data: game } = Query.Stock.useQueryStock({ stockId });

  const startedTime = dayjs(game?.startedTime).toDate();
  const { seconds, minutes } = getDateDistance(startedTime, new Date());

  useEffect(() => {
    const fluctuationsInterval = game?.fluctuationsInterval ?? 5;

    if (audioRef.current) {
      if (minutes % fluctuationsInterval === fluctuationsInterval - 1 && seconds === 51) {
        console.log('오디오 재생을 시도합니다');
        audioRef.current.volume = 1;
        audioRef.current.play();
      }
    }
  }, [game?.fluctuationsInterval, minutes, seconds]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/clock.mp3" />
      {children}
    </>
  );
};

export default PlayingWrapper;
