import React from 'react';
import styled from '@emotion/styled';

interface BadgeProps {
  text: string;
  backgroundColor?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
}

const Badge = ({
  text,
  backgroundColor = '#3e4e37',
  textColor = '#a3e635',
  size = 'medium',
  rounded = true,
}: BadgeProps) => {
  return (
    <Container style={{ backgroundColor }} size={size} rounded={rounded}>
      <Text style={{ color: textColor }} size={size}>
        {text}
      </Text>
    </Container>
  );
};

const Container = styled.div<{ size: string; rounded: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => {
    switch (props.size) {
      case 'small':
        return '2px 6px';
      case 'large':
        return '6px 12px';
      default:
        return '4px 8px';
    }
  }};
  border-radius: ${(props) => (props.rounded ? '100px' : '4px')};
`;

const Text = styled.span<{ size: string }>`
  font-size: ${(props) => {
    switch (props.size) {
      case 'small':
        return '12px';
      case 'large':
        return '16px';
      default:
        return '14px';
    }
  }};
  line-height: 20px;
  letter-spacing: 0.5px;
  font-weight: 400;
`;

export default Badge;
