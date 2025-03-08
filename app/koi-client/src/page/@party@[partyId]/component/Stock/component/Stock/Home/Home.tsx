import StartLoan from '../StartLoan';
import RandomStockPreview from './components/RandomStockPreview';
import { useStockInfo } from './hooks/useStockInfo';
import UserSummary from './components/UserSummary';
import FutureInfoSection from './components/FutureInfoSection';
import { Container, Wrapper, Divider, StickyBottom } from './Home.styles';

interface Props {
  stockId: string;
}

const Home = ({ stockId }: Props) => {
  // 공통 훅 사용으로 데이터 로직 분리
  const {
    stock,
    users,
    user,
    allSellPrice,
    allUserSellPriceDesc,
    gameTimeInMinutes,
    myInfos,
    futureInfos,
    allProfitDesc,
    moneyRatio,
    userId,
  } = useStockInfo(stockId);

  if (!user || !stock) {
    return <div>불러오는 중.</div>;
  }

  return (
    <>
      <Container>
        {/* 사용자 요약 정보 컴포넌트 */}
        <UserSummary
          user={user}
          users={users}
          userId={userId}
          allSellPrice={allSellPrice}
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
        <StartLoan stockId={stockId} />
      </StickyBottom>
    </>
  );
};

export default Home;
