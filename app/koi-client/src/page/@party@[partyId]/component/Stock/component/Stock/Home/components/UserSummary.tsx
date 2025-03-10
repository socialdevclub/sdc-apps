import { Flex } from 'antd';
import { commaizeNumber } from '@toss/utils';
import Card from '../../../../../../../../component-presentation/Card';
import * as COLOR from '../../../../../../../../config/color';
import { MyLevel } from './MyLevel';
import { type UseStockInfo } from '../hooks/useStockInfo';

type UserSummaryProps = Pick<
  UseStockInfo,
  'user' | 'users' | 'userId' | 'allSellPrice' | 'allUserSellPriceDesc' | 'moneyRatio' | 'allProfitDesc' | 'stock'
>;

const UserSummary = ({
  user,
  users,
  userId,
  allSellPrice,
  allUserSellPriceDesc,
  moneyRatio,
  allProfitDesc,
  stock,
}: UserSummaryProps) => {
  if (!user || !stock) return null;

  return (
    <>
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
        rightComponent={stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>}
      />
      <Card
        title="모두 팔고 난 뒤의 순이익"
        value={`${moneyRatio}%`}
        rightComponent={stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>}
      />
    </>
  );
};

export default UserSummary;
