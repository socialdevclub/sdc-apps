import { objectEntries } from '@toss/utils';
import { message } from 'antd';
import { useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { MEDIA_QUERY } from '../../../../../../../config/common';
import { Query } from '../../../../../../../hook';
import { UserStore } from '../../../../../../../store';
import { getStockMessages } from '../../../../../../../utils/stock';
import StartLoan from '../StartLoan';
import { Container, Divider, StickyBottom, Wrapper } from './Home.styles';
import FutureInfoSection from './components/FutureInfoSection';
import RandomStockPreview from './components/RandomStockPreview';
import UserSummary from './components/UserSummary';
import { useStockInfo } from './hooks/useStockInfo';
import StockDrawer from '../StockDrawer';

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
      <StockInfoList
        stockId={stockId}
        futureInfos={futureInfos}
        gameTimeInMinutes={gameTimeInMinutes}
        myInfos={myInfos}
      />
      <StickyBottom>
        <StartLoan stockId={stockId} money={user.money} loanCount={user.loanCount} allSellPrice={myAllSellPrice} />
      </StickyBottom>
    </>
  );
};

export default Home;

interface StockInfoListProps {
  stockId: string;
  futureInfos: Array<{ company: string; price: number; timeIdx: number }>;
  gameTimeInMinutes: number;
  myInfos: Array<{ company: string; price: number; timeIdx: number }>;
}

const StockInfoList = ({ stockId, futureInfos, gameTimeInMinutes, myInfos }: StockInfoListProps) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock, companiesPrice, timeIdx } = Query.Stock.useQueryStock(stockId);
  const { isFreezed, user } = Query.Stock.useUser({ stockId, userId });

  const { mutateAsync: buyStock, isLoading: isBuyLoading } = Query.Stock.useBuyStock();
  const { mutateAsync: sellStock, isLoading: isSellLoading } = Query.Stock.useSellStock();

  const isDesktop = useMediaQuery({ query: MEDIA_QUERY.DESKTOP });

  const [messageApi, contextHolder] = message.useMessage();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const priceData = useMemo(() => {
    const result: Record<string, number[]> = {};
    objectEntries(stock?.companies ?? {}).forEach(([company, companyInfos]) => {
      result[company] = companyInfos.map(({ 가격 }) => 가격);
    });
    return result;
  }, [stock?.companies]);

  const 보유주식 = useMemo(() => {
    return objectEntries(user?.inventory ?? {})
      .filter(([, count]) => count > 0)
      .map(([company, count]) => ({
        company,
        count,
      }));
  }, [user?.inventory]);

  // const 미보유주식 = useMemo(() => {
  //   return objectValues(COMPANY_NAMES).filter((company) => !보유주식.some(({ company: c }) => c === company));
  // }, [보유주식]);

  if (!stock || !userId || !user) {
    return <>불러오는 중</>;
  }

  // const myInfos = objectEntries(stock.companies).flatMap(([company, companyInfos]) =>
  //   companyInfos.reduce((acc, companyInfo, idx) => {
  //     if (companyInfo.정보.includes(userId)) {
  //       acc.push({
  //         company,
  //         price: idx > 0 ? companyInfo.가격 - companyInfos[idx - 1].가격 : 0,
  //         timeIdx: idx,
  //       });
  //     }
  //     return acc;
  //   }, [] as Array<{ company: string; timeIdx: number; price: number }>),
  // );

  const stockMessages = getStockMessages({
    companyName: selectedCompany,
    currentTimeIdx: timeIdx ?? 0,
    stockInfos: myInfos,
  });

  const handleOpenDrawer = (company: string) => {
    setSelectedCompany(company);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setSelectedCompany('');
    setDrawerOpen(false);
  };

  const onClickBuy = (company: string) => {
    buyStock({ amount: 1, company, round: stock.round, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: '주식을 구매하였습니다.',
          duration: 2,
          type: 'success',
        });
      })
      .catch((reason: Error) => {
        messageApi.destroy();
        messageApi.open({
          content: `${reason.message}`,
          duration: 2,
          type: 'error',
        });
      });
  };

  const onClickSell = (company: string, amount = 1) => {
    sellStock({ amount, company, round: stock.round, stockId, unitPrice: companiesPrice[company], userId })
      .then(() => {
        messageApi.destroy();
        messageApi.open({
          content: `주식을 ${amount > 1 ? `${amount}주 ` : ''}판매하였습니다.`,
          duration: 2,
          type: 'success',
        });
      })
      .catch((reason: Error) => {
        messageApi.destroy();
        messageApi.open({
          content: `${reason.message}`,
          duration: 2,
          type: 'error',
        });
      });
  };

  const isLoading = isBuyLoading || isFreezed || isSellLoading;
  const isDisabled = timeIdx === undefined || timeIdx >= 9 || !stock.isTransaction || isLoading;

  return (
    <>
      {contextHolder}
      <Wrapper>
        {/* 미래 정보 섹션 컴포넌트 */}
        <FutureInfoSection
          myInfos={myInfos}
          futureInfos={futureInfos}
          gameTimeInMinutes={gameTimeInMinutes}
          fluctuationsInterval={stock.fluctuationsInterval}
          onClick={handleOpenDrawer}
        />
        <Divider />
        {/* 랜덤 주식 미리보기 컴포넌트 */}
        <RandomStockPreview stockId={stockId} onClick={handleOpenDrawer} />
      </Wrapper>
      <StockDrawer
        drawerOpen={drawerOpen}
        handleCloseDrawer={handleCloseDrawer}
        selectedCompany={selectedCompany}
        stockMessages={stockMessages}
        priceData={priceData}
        stockId={stockId}
        onClickBuy={onClickBuy}
        onClickSell={onClickSell}
      />
    </>
  );
};
