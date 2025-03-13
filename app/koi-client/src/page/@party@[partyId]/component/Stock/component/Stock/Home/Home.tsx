import { commaizeNumber } from '@toss/utils';
import StartLoan from '../StartLoan';
import RandomStockPreview from './components/RandomStockPreview';
import { useStockInfo } from './hooks/useStockInfo';
import UserSummary from './components/UserSummary';
import FutureInfoSection from './components/FutureInfoSection';
import { Container, Wrapper, Divider, StickyBottom } from './Home.styles';
import { Query } from '../../../../../../../hook';

interface Props {
  stockId: string;
}

const Home = ({ stockId }: Props) => {
  // 공통 훅 사용으로 데이터 로직 분리
  const { stock, users, user, allUserSellPriceDesc, gameTimeInMinutes, myInfos, futureInfos, allProfitDesc, userId } =
    useStockInfo(stockId);
  const { myAllSellPrice } = Query.Stock.useMyAllSellPrice({ stockId, userId });
  if (!user || !stock) {
    return <div>불러오는 중..</div>;
  }

  // 내 수익률 계산
  const getProfitRatio = (v: number) => ((v / 1000000) * 100 - 100).toFixed(2);
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
      <Wrapper>
        {/* 미래 정보 섹션 컴포넌트 */}
        <FutureInfoSection
          myInfos={myInfos}
          futureInfos={futureInfos}
          gameTimeInMinutes={gameTimeInMinutes}
          fluctuationsInterval={stock.fluctuationsInterval}
        />
        <Divider />
        {/* 랜덤 주식 미리보기 컴포넌트 */}
        <RandomStockPreview stockId={stockId} />
      </Wrapper>
      <StickyBottom>
        <StartLoan
          stockId={stockId}
          money={user.money}
          loanCount={user.loanCount}
          allSellPrice={commaizeNumber(myAllSellPrice)}
        />
      </StickyBottom>
    </>
  );
};

export default Home;
