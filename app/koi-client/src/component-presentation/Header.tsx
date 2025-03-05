import { styled } from '@linaria/react';
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
      <LeftSection>
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
      </LeftSection>
      <RIghtSection>{RightComponent}</RIghtSection>
    </Container>
  );
};

const Title = styled.div`
  color: white;
  flex: 1 0 auto;
  font-size: 24px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RIghtSection = styled.div`
  flex: 80px;
  display: flex;
  justify-content: flex-end;
`;

const Container = styled.div`
  position: relative;
  padding: 24px 12px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  flex: 80px;
`;

export default Header;
