import React from 'react';
import * as Radix from '@radix-ui/react-scroll-area';
import { css, cx } from '@linaria/core';

export type ScrollViewProps = React.PropsWithChildren<{
  /**
   * 스크롤 노출 여부 설정
   *
   * @default true
   */
  showScrollbar?: boolean;

  onScroll?: (args: React.UIEvent<HTMLDivElement, UIEvent>) => void;
}>;

export const ScrollView = ({ showScrollbar = true, children, onScroll, ...props }: ScrollViewProps) => {
  return (
    <Radix.Root type="always" className={scrollViewStyle} data-f="SR-5f71" {...props}>
      <Radix.Viewport className={viewportStyle} onScroll={onScroll} data-f="SV-3fb5">
        {children}
      </Radix.Viewport>
      <Radix.Scrollbar
        orientation="vertical"
        className={cx(scrollbarStyle, !showScrollbar && hiddenScrollbar)}
        data-f="SS-f84d"
      >
        <Radix.Thumb className={thumbStyle} data-f="ST-5450" />
      </Radix.Scrollbar>
    </Radix.Root>
  );
};

const scrollViewStyle = css`
  width: 100%;
  height: 100%;
`;

const viewportStyle = css`
  width: 100%;
  height: 100%;
  border-radius: inherit;
`;

const scrollbarStyle = css`
  all: revert;
  display: flex;
  /* ensures no selection */
  user-select: none;
  /* disable browser handling of all panning and zooming gestures on touch devices */
  touch-action: none;
`;

const hiddenScrollbar = css`
  visibility: hidden;
`;

/**
 * increase target size for touch devices https://www.w3.org/WAI/WCAG21/Understanding/target-size.html
 */
const thumbStyle = css`
  flex: 1;
  position: relative;
`;
