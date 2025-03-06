import { css } from '@linaria/core';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Header from '../../../component-presentation/Header';

const ProfileHeader = () => {
  const navigate = useNavigate();

  return (
    <Header
      title="프로필"
      LeftComponent={
        <ChevronLeft
          size={32}
          onClick={() => {
            navigate(-1);
          }}
          className={css`
            &:hover {
              cursor: pointer;
            }
          `}
        />
      }
    />
  );
};

export default ProfileHeader;
