import styled from '@emotion/styled';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import React from 'react';

interface AvatarProp {
  isVisible: boolean;
  src?: string;
  onClick?: () => void;
}

type Props = {
  title?: string;
  RightComponent?: React.ReactNode;
} & (
  | {
      avatar?: AvatarProp;
      LeftComponent?: never;
    }
  | {
      avatar?: never;
      LeftComponent?: React.ReactNode;
    }
);

const Header = ({ title, avatar = { isVisible: false }, LeftComponent, RightComponent }: Props) => {
  const { isVisible, src, onClick } = avatar;

  return (
    <Container>
      <AvatarWrapper>
        {LeftComponent || (
          <Avatar
            size="large"
            style={{ cursor: onClick ? 'pointer' : 'default', visibility: isVisible ? 'visible' : 'hidden' }}
            icon={<UserOutlined />}
            src={src}
            onClick={onClick}
          />
        )}
      </AvatarWrapper>
      <Title>{title}</Title>
      <RightComponentWrapper>{RightComponent}</RightComponentWrapper>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  min-height: 64px;
  max-height: 64px;
  background-color: #fefefe;
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const RightComponentWrapper = styled.div`
  flex: 80px;
  display: flex;
  justify-content: flex-end;
`;

const Title = styled.div`
  flex: 1 0 auto;
  display: flex;
  justify-content: center;
`;

const AvatarWrapper = styled.div`
  flex: 80px;
`;

export default Header;
