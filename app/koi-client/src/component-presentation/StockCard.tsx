import styled from '@emotion/styled';
import { ChevronRight } from 'lucide-react';

interface StockCardProps {
  company: string;
  quantity: number;
  onClick?: () => void;
  isActive?: boolean;
  src?: string;
  width?: number;
}

const StockCard = ({ company, quantity, onClick, isActive = false, src, width = 50 }: StockCardProps) => {
  return (
    <StockCardContainer onClick={onClick} isActive={isActive}>
      <Flex style={{ alignItems: 'center', columnGap: 16, flexDirection: 'row' }}>
        {src && <img src={src} alt={company} width={width} />}
        <Flex>
          <CompanyName>{company}</CompanyName>
          <Quantity>보유 주식: {quantity}</Quantity>
        </Flex>
      </Flex>
      <ChevronRight size={32} color="#9CA3AF" />
    </StockCardContainer>
  );
};

const StockCardContainer = styled.li<{ isActive: boolean }>`
  width: 100%;
  height: 86px;
  display: block;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #252836;
  border: 1px solid ${({ isActive }) => (isActive ? '#08A0F7' : '#252836')};
  border-radius: 6px;
  box-shadow: 5px 5px #000000;
  box-sizing: border-box;
  padding: 16px 10px 16px 20px;
  overflow: hidden;
  margin-bottom: 12px;
`;

const Flex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  row-gap: 6px;
`;

const CompanyName = styled.p`
  font-size: 20px;
  line-height: 22px;
  font-weight: 500;
  margin: 0;
  color: white;
  display: flex;
  align-items: center;
  column-gap: 16px;
`;

const Quantity = styled.p`
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.5px;
  font-weight: 400;
  color: white;
  opacity: 0.5;
  margin: 0;
`;

export default StockCard;
