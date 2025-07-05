import { commaizeNumber } from '@toss/utils';
import Card from '../../../../../../../../component-presentation/Card';
import * as COLOR from '../../../../../../../../config/color';
import { 게임모드 } from '../../../../constant';
import { type UseStockInfo } from '../hooks/useStockInfo';
import { MyLevel } from './MyLevel';
import { BEARISH_COLOR, BULLISH_COLOR } from '../../../../color';

const TITLE_MAP = {
  모두팔고난뒤의금액: {
    // 총액, 총자산
    // (잔액 + 주식가치)
    // (user.money + allSellPrice)
    [게임모드.STOCK]: '모두 팔고 난 뒤의 금액',
    [게임모드.REALISM]: '총자산', // 사용 안함
  },
  모두팔고난뒤의순이익: {
    // 초기금액 대비 현재 순수익률
    // (moneyRatio)
    [게임모드.STOCK]: '모두 팔고 난 뒤의 순이익',
    [게임모드.REALISM]: '총 이익', // 사용 안함
  },
  잔액: {
    // 현재 보유금(현금)
    // (user.money)
    [게임모드.STOCK]: '잔액',
    [게임모드.REALISM]: '주문 가능 금액',
  },
  주식가치: {
    // 현재 총 보유 주식 가치
    // (allSellPrice)
    [게임모드.STOCK]: '주식 가치',
    [게임모드.REALISM]: '평가금',
  },
  투자비용: {
    // 현재 보유 중인 주식의 총 구매 비용
    // (totalInvestment)
    [게임모드.STOCK]: '총 투자 비용', // 사용 안함
    [게임모드.REALISM]: '매입금',
  },
  현재주식수익: {
    // 보유 주식의 투자 비용 대비 순수익금, 순수익률
    // (주식가치 - 투자비용) & (주식가치/투자비용 * 100)
    // (totalProfitLoss) & (totalProfitLoss / totalInvestment) * 100)
    [게임모드.STOCK]: '현재 주식 수익', // 사용 안함
    [게임모드.REALISM]: '순수익',
  },
};

type UserSummaryProps = Pick<
  UseStockInfo,
  'user' | 'users' | 'userId' | 'allUserSellPriceDesc' | 'allProfitDesc' | 'stock'
> & {
  moneyRatio: string;
  allSellPrice: number;
  totalInvestment: number;
  totalProfitLoss: number;
};

const UserSummary = ({
  user,
  users,
  userId,
  allSellPrice,
  allUserSellPriceDesc,
  moneyRatio,
  allProfitDesc,
  stock,
  totalInvestment,
  totalProfitLoss,
}: UserSummaryProps) => {
  if (!user || !stock) return null;

  const totalProfitLossPercentage =
    totalInvestment > 0 ? Math.round((totalProfitLoss / totalInvestment) * 100 * 10) / 10 : 0;
  const formattedProfitLossPercentage = `${totalProfitLoss > 0 ? '+' : ''}${totalProfitLossPercentage}%`;

  return (
    <>
      <MyLevel moneyRatio={moneyRatio} initialMoney={stock.initialMoney} />
      <Card
        title={TITLE_MAP['잔액'][stock.gameMode]}
        value={`₩${commaizeNumber(user.money)}`}
        valueColor={COLOR.pastelGreen}
        rightComponent={
          stock.isVisibleRank && users ? (
            <>{users.sort((a, b) => b.money - a.money).findIndex((v) => v.userId === userId) + 1}위</>
          ) : (
            <></>
          )
        }
      />
      <Card
        title={TITLE_MAP['주식가치'][stock.gameMode]}
        valueColor={COLOR.pastelViolet}
        value={`₩${commaizeNumber(allSellPrice)}`}
        rightComponent={
          stock.isVisibleRank ? <>{allUserSellPriceDesc().findIndex((v) => v.userId === userId) + 1}위</> : <></>
        }
      />
      {stock.gameMode === 게임모드.STOCK && (
        <Card
          title={TITLE_MAP['모두팔고난뒤의금액'][stock.gameMode]}
          value={`₩${commaizeNumber(user.money + allSellPrice)}`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
        />
      )}
      {stock.gameMode === 게임모드.STOCK && (
        <Card
          title={TITLE_MAP['모두팔고난뒤의순이익'][stock.gameMode]}
          value={`${moneyRatio}%`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
        />
      )}
      {stock.gameMode === 게임모드.REALISM && (
        <Card
          title={TITLE_MAP['투자비용'][stock.gameMode]}
          value={`₩${commaizeNumber(totalInvestment)}`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
        />
      )}
      {stock.gameMode === 게임모드.REALISM && (
        <Card
          title={TITLE_MAP['현재주식수익'][stock.gameMode]}
          value={`₩${commaizeNumber(totalProfitLoss)} (${formattedProfitLossPercentage})`}
          rightComponent={
            stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>
          }
          valueColor={
            // totalProfitLossPercentage > 0 ? COLOR.red : totalProfitLossPercentage < 0 ? COLOR.colorDown : '#FFFFFF'
            totalProfitLossPercentage > 0 ? BULLISH_COLOR : totalProfitLossPercentage < 0 ? BEARISH_COLOR : '#FFFFFF'
          }
        />
      )}
    </>
  );
};

export default UserSummary;
