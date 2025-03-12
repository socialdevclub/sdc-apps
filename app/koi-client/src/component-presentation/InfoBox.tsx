import styled from '@emotion/styled';
import { CSSProperties } from 'react';

interface InfoBoxProps {
  title?: string;
  value: React.ReactNode;
  valueColor?: CSSProperties['color'];
  leftTime?: React.ReactNode;
  changeTime?: React.ReactNode;
  onClick?: () => void;
  opacity?: number;
  src?: string;
  width?: number;
}

const InfoBox = ({
  title,
  value,
  valueColor,
  leftTime,
  changeTime,
  onClick,
  opacity = 1,
  src,
  width = 36,
}: InfoBoxProps) => {
  return (
    <Container onClick={onClick} opacity={opacity}>
      <Wrapper>
        <TimeWrapper>
          {leftTime}
          {changeTime}
        </TimeWrapper>
        {title && (
          <ContainerTitle>
            {src && <img src={src} alt={title} width={width} />}
            <span>{title}</span>
          </ContainerTitle>
        )}
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

const Container = styled.div<{ opacity?: number }>`
  display: flex;
  justify-content: space-between;
  background-color: #252836;
  border-radius: 8px;
  padding: 16px;
  overflow: hidden;
  opacity: ${({ opacity }) => opacity};
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TimeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 4px;
  background-color: #374151;
  padding: 10px 8px;
  border-radius: 4px;
  text-align: center;
  gap: 2px;
`;

const ContainerTitle = styled.div`
  font-size: 20px;
  line-height: 22px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  column-gap: 4px;
`;

const ContainerBolder = styled.div`
  font-size: 20px;
  font-weight: 400;
  display: flex;
  align-items: center;
  letter-spacing: 0.5px;
`;

export default InfoBox;
