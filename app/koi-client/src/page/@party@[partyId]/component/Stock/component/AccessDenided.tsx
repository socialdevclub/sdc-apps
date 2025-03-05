import { useDisableScrollView } from '../../../hook/useDisableScrollView';

const AccessDenided = () => {
  useDisableScrollView();

  return <>방에 접근할 권한이 없습니다</>;
};

export default AccessDenided;
