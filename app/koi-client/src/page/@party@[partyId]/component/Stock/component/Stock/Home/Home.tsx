import { MessageInstance } from 'antd/es/message/interface';
import { Query } from '../../../../../../../hook';
import StartLoan from '../StartLoan';
import { Container, Divider, StickyBottom } from './Home.styles';
import UserSummary from './components/UserSummary';
import { useStockInfo } from './hooks/useStockInfo';
import TimeIndicator from './components/TimeIndicator.tsx';
import { StockHoldingsList } from './components/StockInfoList.tsx';

interface Props {
  stockId: string;
  messageApi: MessageInstance;
}

const Home = ({ stockId, messageApi }: Props) => {
  // 공통 훅 사용으로 데이터 로직 분리
  const { stock, users, user, allUserSellPriceDesc, gameTimeInMinutes, myInfos, futureInfos, allProfitDesc, userId } =
    useStockInfo(stockId);
  const { myAllSellPrice } = Query.Stock.useMyAllSellPrice({ stockId, userId });
  if (!user || !stock || !userId) {
    return <div>불러오는 중..</div>;
  }

  // 내 수익률 계산
  const getProfitRatio = (v: number) => ((v / stock.initialMoney) * 100 - 100).toFixed(2);
  const moneyRatio = getProfitRatio(user.money + myAllSellPrice);

  return (
    <>
      <Container>
        {/* 사용자 요약 정보 컴포넌트 */}
        <UserSummary
          user={user}
          users={users}
          userId={userId}
          allSellPrice={myAllSellPrice}
          allUserSellPriceDesc={allUserSellPriceDesc}
          moneyRatio={moneyRatio}
          allProfitDesc={allProfitDesc}
          stock={stock}
        />
      </Container>
      <Divider />
      <Container>
        <TimeIndicator />
      </Container>
      <Divider />
      <StockHoldingsList stockId={stockId} userId={userId} messageApi={messageApi} />
      {stock.roomOptions.loan && (
        <StickyBottom>
          <StartLoan stockId={stockId} money={user.money} loanCount={user.loanCount} allSellPrice={myAllSellPrice} />
        </StickyBottom>
      )}
    </>
  );
};

export default Home;
