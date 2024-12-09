import React from 'react';
import ReactDOM from 'react-dom';

export interface PortalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'css'> {
  isOpen?: boolean;
  target?: HTMLElement | null;
}

const Portal = React.forwardRef<HTMLDivElement, PortalProps>(function Portal(
  { isOpen = false, target = document.body, ...props },
  ref,
) {
  // Portal안에 에러가 발생함 왜?
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return isOpen && !!target ? ReactDOM.createPortal(<div ref={ref} {...props} />, target) : <></>;
});

export default Portal;
