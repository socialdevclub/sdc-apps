import { Flex } from 'antd';
import { useAtomValue } from 'jotai';
import { commaizeNumber } from '@toss/utils';
import styled from '@emotion/styled';
import { UserStore } from '../../../../../../../store';
import { Query } from '../../../../../../../hook';
import DrawStockInfo from '../DrawInfo';
import { MyLevel } from './MyLevel';
import Card from '../../../../../../../component-presentation/Card';
import * as COLOR from '../../../../../../../config/color';
import StartLoan from '../StartLoan';

const getProfitRatio = (v: number) => ((v / 1000000) * 100 - 100).toFixed(2);

interface Props {
  stockId: string;
}

const Home = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);
  const { user } = Query.Stock.useUser({ stockId, userId });

  const { allSellPrice, allUserSellPriceDesc } = Query.Stock.useAllSellPrice({ stockId, userId });

  if (!user || !stock) {
    return <div>불러오는 중.</div>;
  }

  const allProfitDesc = allUserSellPriceDesc()
    .map(({ userId, allSellPrice }) => {
      const user = users.find((v) => v.userId === userId);
      if (!user) {
        return {
          profit: 0,
          userId,
        };
      }

      return {
        profit: allSellPrice + user.money,
        userId,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  const moneyRatio = getProfitRatio(user.money + allSellPrice);

  return (
    <>
      <Container>
        <MyLevel moneyRatio={moneyRatio} initialMoney={1000000} />
        <Flex gap={12} css={{ width: '100%' }}>
          <Card
            title="잔액"
            value={`₩${commaizeNumber(user.money)}`}
            valueColor={COLOR.pastelGreen}
            rightComponent={
              stock.isVisibleRank ? (
                <>{users.sort((a, b) => b.money - a.money).findIndex((v) => v.userId === userId) + 1}위</>
              ) : (
                <></>
              )
            }
          />
          <Card
            title="주식 가치"
            valueColor={COLOR.pastelViolet}
            value={`₩${commaizeNumber(allSellPrice)}`}
            rightComponent={
              stock.isVisibleRank ? <>{allUserSellPriceDesc().findIndex((v) => v.userId === userId) + 1}위</> : <></>
            }
          />
        </Flex>
        <Card
          title="모두 팔고 난 뒤의 금액"
          value={`₩${commaizeNumber(user.money + allSellPrice)}`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
        />
        <Card
          title="모두 팔고 난 뒤의 순이익"
          value={`${moneyRatio}%`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
        />
        <br />
        <Flex align="center" justify="space-between" gap={4} css={{ width: '100%' }}>
          <H3>내가 가진 정보</H3>
          <DrawStockInfo stockId={stockId} />
        </Flex>
      </Container>
      <StickyBottom>
        <StartLoan stockId={stockId} />
      </StickyBottom>
    </>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 12px;
  padding: 12px 0 100px 0;
  flex: 1 1 0;
`;

const H3 = styled.h3`
  text-shadow: 2px 2px #8461f8;
`;

// TODO: 만약 영역이 겹치는 이슈가 발생 시 수정
const StickyBottom = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #252836;
  border-top: 1px solid #374151;
  padding: 20px;
  box-sizing: border-box;
`;

export default Home;
