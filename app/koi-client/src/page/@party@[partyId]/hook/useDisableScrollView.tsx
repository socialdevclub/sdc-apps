import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { UiStore } from '../../../store';

export const useDisableScrollView = () => {
  const setIsScrollView = useSetAtom(UiStore.isScrollView);
  useEffect(() => {
    setIsScrollView(false);
    return () => {
      setIsScrollView(true);
    };
  }, [setIsScrollView]);
};
