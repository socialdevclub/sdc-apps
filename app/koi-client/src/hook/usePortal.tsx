import { ReactNode, useCallback, useEffect, useRef, useState, useMemo, RefObject } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  /**
   * @default `document.body`
   */
  targetEl?: HTMLElement;
  initialState?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

type PortalHookReturnType = {
  isOpen: boolean;
  openPortal: () => void;
  closePortal: () => void;
  togglePortal: () => void;
  overlayRef: RefObject<HTMLDivElement>;
  Portal: ({ children }: { children: ReactNode }) => JSX.Element;
};

const usePortal = ({ targetEl, initialState = false, onOpen, onClose }: Props = {}): PortalHookReturnType => {
  const [isOpen, setPortalOpen] = useState(initialState);
  const portalRef = useRef<HTMLElement>(document.createElement('div'));
  const overlayRef = useRef<HTMLDivElement>(null);

  const target = useMemo(() => {
    return targetEl || document.body;
  }, [targetEl]);

  const openPortal = useCallback(() => {
    if (portalRef.current) {
      if (onOpen) {
        onOpen();
      }
      setPortalOpen(true);
    }
  }, [onOpen]);

  const closePortal = useCallback(() => {
    if (portalRef.current && isOpen) {
      if (onClose) {
        onClose();
      }
      setPortalOpen(false);
    }
  }, [onClose, isOpen]);

  const togglePortal = useCallback(() => {
    if (isOpen) {
      closePortal();
      return;
    }
    openPortal();
  }, [closePortal, openPortal, isOpen]);

  const handleOverlayMouseClick = useCallback(
    (e: Event) => {
      if (overlayRef.current && (e.target as HTMLElement) === overlayRef.current) {
        closePortal();
      }
    },
    [closePortal],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!target || !portalRef.current) return;

    const node = portalRef.current;
    target.appendChild(node);
    document.addEventListener('mousedown', handleOverlayMouseClick);

    // eslint-disable-next-line consistent-return
    return (): void => {
      document.removeEventListener('mousedown', handleOverlayMouseClick);
      target.removeChild(node);
    };
  }, [target, handleOverlayMouseClick, isOpen]);

  const Portal = useCallback(({ children }: { children: ReactNode }) => {
    const modalContainer = portalRef.current;
    // children에 원인모를 타입 에러
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return modalContainer ? createPortal(children, modalContainer) : <></>;
  }, []);

  return {
    Portal,
    closePortal,
    isOpen,
    openPortal,
    overlayRef,
    togglePortal,
  };
};

export default usePortal;
