import { useEffect, useRef, useState } from 'react';

const useTimeout = () => {
  const timeoutRef = useRef(window.setTimeout(() => {}));
  const [state] = useState<{
    setTimeout: (fn: () => void, timeout: number) => void;
    clearTimeout: () => void;
  }>(() => ({
    clearTimeout: () => {
      clearTimeout(timeoutRef.current);
    },
    setTimeout: (fn: () => void, timeout: number) => {
      state.clearTimeout();
      timeoutRef.current = window.setTimeout(fn, timeout);
    },
  }));

  useEffect(() => () => state.clearTimeout(), [state]);

  return [state.setTimeout, state.clearTimeout] as const;
};

export default useTimeout;
