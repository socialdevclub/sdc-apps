import React, { useEffect } from 'react';
import ReactPlayer from 'react-player';
import styled from '@emotion/styled';
import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import { Query } from '../../../../hook';

interface Props {
  children: React.ReactNode;
  stockId: string;
}

const PlayingWrapper = ({ children, stockId }: Props) => {
  const playerRef = React.useRef<ReactPlayer>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const { data: game } = Query.Stock.useQueryStock(stockId);
  const [onReadyPlayer, setOnReadyPlayer] = React.useState(false);
  const [isHidePlayer, setIsHidePlayer] = React.useState(true);

  const startedTime = dayjs(game?.startedTime).toDate();
  const { seconds, minutes } = getDateDistance(startedTime, new Date());

  useEffect(() => {
    // h키를 누르면 플레이어를 숨긴다
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h') {
        setIsHidePlayer((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // space키를 누르면 플레이어를 재생한다
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        if (playerRef.current?.getInternalPlayer().getPlayerState() === 1) {
          playerRef.current?.getInternalPlayer().pauseVideo();
        } else {
          playerRef.current?.getInternalPlayer().playVideo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // useEffect(() => {
  //   if (playerRef.current && onReadyPlayer) {
  //     playerRef.current.getInternalPlayer().loadPlaylist({
  //       list: 'PLp1Kre441jUDUyAof7yA4ul9-Wits0jL1',
  //       listType: 'playlist',
  //     });
  //     playerRef.current.getInternalPlayer().setLoop(true);
  //     playerRef.current.getInternalPlayer().setVolume(100);
  //     playerRef.current.getInternalPlayer().playVideo();
  //   }
  // }, [onReadyPlayer]);

  useEffect(() => {
    const fluctuationsInterval = game?.fluctuationsInterval ?? 5;

    if (audioRef.current) {
      if (minutes % fluctuationsInterval === fluctuationsInterval - 1 && seconds === 51) {
        console.log('오디오 재생을 시도합니다');
        audioRef.current.volume = 1;
        audioRef.current.play();
        playerRef.current?.getInternalPlayer().setVolume(20);
      }
    }

    if (seconds === 3 || seconds === 4) {
      playerRef.current?.getInternalPlayer().setVolume(100);
    }
  }, [game?.fluctuationsInterval, minutes, seconds]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src="/clock.mp3" />
      {children}
      <PlayerWrapper isHide={isHidePlayer}>
        <ReactPlayer
          ref={playerRef}
          url="https://www.youtube.com/watch?v=5lhRXK6bwzc"
          width={150}
          height={150}
          loop
          onReady={() => {
            setOnReadyPlayer(true);
          }}
          onEnded={() => {
            playerRef.current?.getInternalPlayer().nextVideo();
          }}
        />
      </PlayerWrapper>
    </>
  );
};

export default PlayingWrapper;

const PlayerWrapper = styled.div<{ isHide: boolean }>`
  position: absolute;
  bottom: 10px;
  left: 10px;
  opacity: ${({ isHide }) => (isHide ? 0 : 1)};
`;
