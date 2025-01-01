import React from 'react';
import * as Radix from '@radix-ui/react-scroll-area';
import styled from '@emotion/styled';

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
    <RootContainer type="always" data-f="SR-5f71" {...props}>
      <Viewport onScroll={onScroll} data-f="SV-3fb5">
        {children}
      </Viewport>
      <ScrollbarComponent orientation="vertical" data-f="SS-f84d" showScrollbar={showScrollbar}>
        <Thumb data-f="ST-5450" />
      </ScrollbarComponent>
    </RootContainer>
  );
};

const Thumb = styled(Radix.Thumb)`
  flex: 1;
  position: relative;
`;

const RootContainer = styled(Radix.Root)`
  width: 100%;
  height: 100%;
`;

const Viewport = styled(Radix.Viewport)`
  width: 100%;
  height: 100%;
  border-radius: inherit;
`;

const ScrollbarComponent = styled(Radix.Scrollbar)<{ showScrollbar: boolean }>(
  `
  all: revert;
  display: flex;
  /* ensures no selection */
  user-select: none;
  /* disable browser handling of all panning and zooming gestures on touch devices */
  touch-action: none;
`,
  ({ showScrollbar }) => `
  ${showScrollbar && 'visibility: hidden'}
  `,
);
