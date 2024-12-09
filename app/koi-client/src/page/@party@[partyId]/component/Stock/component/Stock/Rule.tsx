import styled from '@emotion/styled';
import { Query } from '../../../../../../hook';

interface Props {
  stockId: string;
}

const Rule = ({ stockId }: Props) => {
  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);

  return (
    <>
      <Line>1. 다른 사람에게 자신의 휴대폰 화면을 보여줄 수 없습니다</Line>
      <Line>2. 한 회사의 주식은 최대 {Math.floor(users.length - 1)}개 까지만 보유할 수 있습니다</Line>
      <Line>3. 거래(사기/팔기)를 한 번 하면 {stock?.transactionInterval}초 동안 거래를 할 수 없습니다</Line>
      <Line>4. 각 회사마다 총 {users.length * 3}개의 주식이 판매됩니다</Line>
    </>
  );
};

const Line = styled.div`
  margin-bottom: 24px;
`;

export default Rule;
