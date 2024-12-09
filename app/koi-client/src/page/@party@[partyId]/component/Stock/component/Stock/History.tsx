import { useAtomValue } from 'jotai';
import { getDateDistance } from '@toss/date';
import { commaizeNumber } from '@toss/utils';
import { css } from '@emotion/react';
import dayjs from 'dayjs';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import prependZero from '../../../../../../service/prependZero';
import Box from '../../../../../../component-presentation/Box';
import { colorDown, colorUp } from '../../../../../../config/color';

interface Props {
  stockId: string;
}

const History = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: logList } = Query.Stock.useQueryLog({ stockId, userId });
  const { data: game } = Query.Stock.useQueryStock(stockId);

  if (!game) {
    return <></>;
  }

  return (
    <>
      {logList.map((log) => {
        const { minutes, seconds } = getDateDistance(dayjs(game.startedTime).toDate(), log.date);
        const date = `${prependZero(minutes, 2)}:${prependZero(seconds, 2)}`;
        return (
          <Box
            title={date}
            value={log.company}
            rightComponent={
              <div
                css={css`
                  font-size: 18px;
                  color: ${log.action === 'BUY' ? colorUp : colorDown};
                `}
              >
                {commaizeNumber(log.price)}원에 {log.action === 'BUY' ? '샀음' : '팔음'}
              </div>
            }
            key={date}
          />
        );
      })}
      {/* <Box title="" value="" /> */}
    </>
  );
};

export default History;
