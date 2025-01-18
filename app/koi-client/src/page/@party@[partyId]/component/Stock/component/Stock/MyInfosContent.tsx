import { commaizeNumber } from '@toss/utils';
import { css } from '@emotion/react';
import prependZero from '../../../../../../service/prependZero';
import { colorDown, colorUp } from '../../../../../../config/color';
import Box from '../../../../../../component-presentation/Box';

type Props = {
  myInfos: {
    company: string;
    timeIdx: number;
    price: number;
  }[];
  fluctuationsInterval: number;
};

const MyInfosContent = ({ myInfos, fluctuationsInterval }: Props) => {
  return (
    <>
      {myInfos.map(({ company, price, timeIdx }) => {
        return (
          <Box
            key={`${company}_${timeIdx}`}
            title={`${company}`}
            value={`${price >= 0 ? '▲' : '▼'}${commaizeNumber(Math.abs(price))}`}
            valueColor={price >= 0 ? colorUp : colorDown}
            rightComponent={
              <div
                css={css`
                  font-size: 18px;
                `}
              >
                {prependZero(timeIdx * fluctuationsInterval, 2)}:00
              </div>
            }
          />
        );
      })}
    </>
  );
};

export default MyInfosContent;
