import { css } from '@emotion/react';
import InfoBox from '../../../../../../../../component-presentation/InfoBox';
import prependZero from '../../../../../../../../service/prependZero';

interface StockInfoBoxProps {
  title: string;
  value: React.ReactNode;
  valueColor: string;
  remainingTime: number;
  changeTime: number | string;
  onClick?: () => void;
  src?: string;
  width?: number;
}

const StockInfoBox = (props: StockInfoBoxProps) => {
  const { changeTime, remainingTime, ...rest } = props;

  return (
    <InfoBox
      {...rest}
      leftTime={
        <div
          css={css`
            font-size: 14px;
            color: #c084fc;
            min-width: 50px;
            letter-spacing: 0.5px;
            line-height: 22px;
          `}
        >
          {remainingTime <= 1 ? <span style={{ color: '#f96257' }}>🚨 임박</span> : `${remainingTime}분 후`}
        </div>
      }
      changeTime={
        <div
          css={css`
            font-size: 12px;
            color: #9ca3af;
            letter-spacing: 0.5px;
            line-height: 14px;
          `}
        >
          {typeof changeTime === 'number' ? `${prependZero(changeTime, 2)}:00` : changeTime}
        </div>
      }
    />
  );
};

export default StockInfoBox;
