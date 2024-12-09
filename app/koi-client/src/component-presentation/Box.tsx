import React, { CSSProperties } from 'react';
import { styled } from '@linaria/react';

interface BoxProps {
  title?: string;
  value: string;
  valueColor?: CSSProperties['color'];
  rightComponent?: React.ReactNode;
}

const Box: React.FC<BoxProps> = ({ title, value, valueColor, rightComponent }) => {
  return (
    <Container>
      <div>
        {title && <ContainerTitle>{title}</ContainerTitle>}
        <ContainerBolder
          style={{
            color: valueColor,
          }}
        >
          {value}
        </ContainerBolder>
      </div>
      {rightComponent}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #000084;
  box-shadow: 5px 5px #000000;
  box-sizing: border-box;
  padding: 12px;
  overflow: hidden;

  margin-bottom: 12px;
`;

const ContainerTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const ContainerBolder = styled.div`
  font-size: 24px;
  font-weight: bolder;
`;

export default Box;
