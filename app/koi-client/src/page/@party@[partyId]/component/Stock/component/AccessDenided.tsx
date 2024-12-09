import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { UiStore } from '../../../../../store';

const AccessDenided = () => {
  const setIsScrollView = useSetAtom(UiStore.isScrollView);

  useEffect(() => {
    setIsScrollView(false);
    return () => {
      setIsScrollView(true);
    };
  }, [setIsScrollView]);

  return <>방에 접근할 권한이 없습니다</>;
};

export default AccessDenided;
