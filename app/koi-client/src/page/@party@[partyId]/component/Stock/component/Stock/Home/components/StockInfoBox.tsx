import { css } from '@emotion/react';
import InfoBox from '../../../../../../../../component-presentation/InfoBox';
import prependZero from '../../../../../../../../service/prependZero';

interface StockInfoBoxProps {
  title: string;
  value: string;
  valueColor: string;
  remainingTime: number;
  changeTime: number | string;
}

const StockInfoBox = ({ title, value, valueColor, remainingTime, changeTime }: StockInfoBoxProps) => {
  return (
    <InfoBox
      key={`${title}_${changeTime}`}
      title={title}
      value={value}
      valueColor={valueColor}
      leftTime={
        <div
          css={css`
            font-size: 14px;
            color: #c084fc;
            min-width: 50px;
            letter-spacing: 0.5px;
          `}
        >
          {remainingTime <= 1 ? `🚨 임박` : `${remainingTime}분 후`}
        </div>
      }
      changeTime={
        <div
          css={css`
            font-size: 12px;
            color: #9ca3af;
            letter-spacing: 0.5px;
          `}
        >
          {typeof changeTime === 'number' ? `${prependZero(changeTime, 2)}:00` : changeTime}
        </div>
      }
    />
  );
};

export default StockInfoBox;
