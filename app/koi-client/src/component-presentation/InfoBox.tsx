import styled from '@emotion/styled';
import { CSSProperties } from 'react';

interface InfoBoxProps {
  title?: string;
  value: string;
  valueColor?: CSSProperties['color'];
  leftTime?: React.ReactNode;
  changeTime?: React.ReactNode;
}

const InfoBox = ({ title, value, valueColor, leftTime, changeTime }: InfoBoxProps) => {
  return (
    <Container>
      <Wrapper>
        <TimeWrapper>
          {leftTime}
          {changeTime}
        </TimeWrapper>
        {title && <ContainerTitle>{title}</ContainerTitle>}
      </Wrapper>
      <ContainerBolder
        style={{
          color: valueColor,
        }}
      >
        {value}
      </ContainerBolder>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: #252836;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TimeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  background-color: #374151;
  padding: 10px 8px;
  border-radius: 4px;
  text-align: center;
`;

const ContainerTitle = styled.div`
  font-size: 20px;
  line-height: 22px;
  letter-spacing: 0.5px;
`;

const ContainerBolder = styled.div`
  font-size: 20px;
  font-weight: 400;
  display: flex;
  align-items: center;
  letter-spacing: 0.5px;
`;

export default InfoBox;
