import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import Header from '../../../component-presentation/Header';

const ProfileHeader = () => {
  const navigate = useNavigate();

  return (
    <Header
      title="프로필"
      LeftComponent={
        <ArrowLeftOutlined
          size={60}
          onClick={() => {
            navigate(-1);
          }}
          css={css`
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
