import React, { CSSProperties } from 'react';
import { css } from '@linaria/core';
import { useMediaQuery } from 'react-responsive';
import { ScrollView } from './ScrollView';

interface Props {
  children?: React.ReactNode;
  HeaderComponent?: React.ReactNode;
  justifyContent?: CSSProperties['justifyContent'];
  padding?: CSSProperties['padding'];
  backgroundColor?: CSSProperties['backgroundColor'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ScrollViewComponent?: React.ComponentType<any>;
}

const MobileLayout = ({
  children,
  HeaderComponent,
  justifyContent = 'center',
  padding = '20px',
  backgroundColor = '#f1f1f1',
  ScrollViewComponent = ScrollView,
}: Props) => {
  const isDesktop = useMediaQuery({ query: `(min-width: 800px)` });

  return (
    <div
      className={css`
        display: flex;
        justify-content: center;
        width: 100%;
        height: 100%;
      `}
    >
      <div
        className={css`
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 400px;
          height: 100%;
        `}
        style={{
          maxWidth: isDesktop ? '400px' : '100%',
        }}
      >
        {HeaderComponent}
        <div
          className={css`
            display: flex;
            flex-direction: column;
            flex: 1 1 auto;
            /* 이걸 넣어야 내부 스크롤 가능 */
            min-height: 0;
          `}
          style={{
            backgroundColor,
            justifyContent,
            padding,
          }}
        >
          <ScrollViewComponent>{children}</ScrollViewComponent>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
