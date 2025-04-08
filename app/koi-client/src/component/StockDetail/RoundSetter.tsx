import styled from '@emotion/styled';
import { Query } from '../../hook';

interface Props {
  stockId: string;
}

const RoundSetter = ({ stockId }: Props) => {
  const { data: game } = Query.Stock.useQueryStock(stockId);
  const { mutateAsync: mutateUpdateGame } = Query.Stock.useUpdateStock();

  // 주식 가치 계산을 위한 훅 추가
  const { allUserSellPriceDesc } = Query.Stock.useAllUserSellPriceDesc(stockId);
  const isAllSellPriceZero = allUserSellPriceDesc().every((v) => v.allSellPrice === 0);

  if (!game) return <></>;

  return (
    <RoundSetterContainer>
      <RoundControls>
        <RoundButton
          onClick={() => {
            if (!isAllSellPriceZero) {
              alert('주식 종료 및 정산을 먼저 해주세요');
              return;
            }
            mutateUpdateGame({
              _id: stockId,
              round: Math.max(0, game.round - 1),
            });
          }}
        >
          -
        </RoundButton>
        <RoundDisplay>{game.round}</RoundDisplay>
        <RoundButton
          onClick={() => {
            if (!isAllSellPriceZero) {
              alert('주식 종료 및 정산을 먼저 해주세요');
              return;
            }
            mutateUpdateGame({
              _id: stockId,
              round: game.round + 1,
            });
          }}
        >
          +
        </RoundButton>
      </RoundControls>
    </RoundSetterContainer>
  );
};

export default RoundSetter;

// 스타일 컴포넌트
const RoundSetterContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const RoundControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const RoundButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #f5f5f5;
  border: 1px solid #e0e0e0;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e9ecef;
    border-color: #ced4da;
  }

  &:active {
    background-color: #dee2e6;
  }
`;

const RoundDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 32px;
  padding: 0 0.8rem;
  background-color: #3f51b5;
  color: white;
  font-weight: 600;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;
