import React, { CSSProperties } from 'react';
import styled from '@emotion/styled';

interface Props {
  title?: string;
  value: string;
  valueColor?: CSSProperties['color'];
  rightComponent?: React.ReactNode;
}

const Card = ({ title, value, valueColor, rightComponent }: Props) => {
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
  align-items: center;
  justify-content: space-between;
  background-color: #252836;
  box-sizing: border-box;
  padding: 10px 12px;
  overflow: hidden;
  border-radius: 6px;
`;

const ContainerTitle = styled.div`
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #d1d5db;
  line-height: 22px;
`;

const ContainerBolder = styled.div`
  font-size: 24px;
  line-height: 22px;
  font-weight: 400;
`;

export default Card;
