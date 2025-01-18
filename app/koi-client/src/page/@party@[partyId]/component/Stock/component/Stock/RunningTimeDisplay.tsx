import { useEffect, useState } from 'react';
import { getDateDistance } from '@toss/date';
import dayjs from 'dayjs';
import Box from '../../../../../../component-presentation/Box';
import prependZero from '../../../../../../service/prependZero';

const getSecondsTime = (startTime: string) => {
  return prependZero(getDateDistance(dayjs(startTime).toDate(), new Date()).seconds, 2);
};

const getMinutesTime = (startTime: string) => {
  return prependZero(getDateDistance(dayjs(startTime).toDate(), new Date()).minutes, 2);
};

const RunningTimeDisplay = ({ startTime }: { startTime: string }) => {
  const [time, setTime] = useState(() => `${getMinutesTime(startTime)}:${getSecondsTime(startTime)}`);

  useEffect(() => {
    const updateTime = () => {
      const newTime = `${getMinutesTime(startTime)}:${getSecondsTime(startTime)}`;
      setTime(newTime);
    };

    // 초기 시간 동기화
    updateTime();

    const timer = setInterval(updateTime, 1000);

    // window focus 이벤트에 대한 처리 // refetchIntervalInBackground 옵션 예외 처리
    const handleFocus = () => {
      updateTime();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [startTime]);

  return <Box title="진행 시간" value={time} />;
};

RunningTimeDisplay.displayName = 'RunningTimeDisplay';

export default RunningTimeDisplay;
