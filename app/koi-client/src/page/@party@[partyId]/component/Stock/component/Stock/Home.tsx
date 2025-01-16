import { useAtomValue } from 'jotai';
import { commaizeNumber, objectEntries } from '@toss/utils';
import styled from '@emotion/styled';
import { Flex } from 'antd';
import { UserStore } from '../../../../../../store';
import { Query } from '../../../../../../hook';
import Box from '../../../../../../component-presentation/Box';
import DrawStockInfo from './DrawInfo';
import MyInfosContent from './MyInfosContent';
import RunningTimeDisplay from './RunningTimeDisplay';

const getProfitRatio = (v: number) => ((v / 1000000) * 100 - 100).toFixed(2);

interface Props {
  stockId: string;
}

const Home = ({ stockId }: Props) => {
  const supabaseSession = useAtomValue(UserStore.supabaseSession);
  const userId = supabaseSession?.user.id;

  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));
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

  const [partnerIds, myInfos] = objectEntries(stock.companies).reduce(
    (reducer, [company, companyInfos]) => {
      const [partnerIds, myInfos] = reducer;

      companyInfos.forEach((companyInfo, idx) => {
        if (companyInfos[idx].정보.some((name) => name === userId)) {
          const partner = companyInfos[idx].정보.find((name) => name !== userId);
          if (partner && !partnerIds.some((v) => v === partner)) {
            partnerIds.push(partner);
          }
          myInfos.push({
            company,
            price: companyInfo.가격 - companyInfos[idx - 1].가격,
            timeIdx: idx,
          });
        }
      });

      return reducer;
    },
    [[], []] as [Array<string>, Array<{ company: string; timeIdx: number; price: number }>],
  );

  const partnerNicknames = profiles?.data
    ?.map((v) => {
      if (partnerIds.some((partnerId) => partnerId === v.id)) {
        return v.username;
      }

      return undefined;
    })
    .filter((v) => !!v);

  return (
    <>
      <H3>홈</H3>
      <RunningTimeDisplay startTime={stock.startedTime} />
      <Box
        title="잔액"
        value={`${commaizeNumber(user.money)}원`}
        rightComponent={
          stock.isVisibleRank ? (
            <>{users.sort((a, b) => b.money - a.money).findIndex((v) => v.userId === userId) + 1}위</>
          ) : (
            <></>
          )
        }
      />
      <Box
        title="주식 가치"
        value={`${commaizeNumber(allSellPrice)}원`}
        rightComponent={
          stock.isVisibleRank ? <>{allUserSellPriceDesc().findIndex((v) => v.userId === userId) + 1}위</> : <></>
        }
      />
      <Box
        title="모두 팔고 난 뒤의 금액"
        value={`${commaizeNumber(user.money + allSellPrice)}원`}
        rightComponent={stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>}
      />
      <Box
        title="모두 팔고 난 뒤의 순이익"
        value={`${getProfitRatio(user.money + allSellPrice)}%`}
        rightComponent={stock.isVisibleRank ? <>{allProfitDesc.findIndex((v) => v.userId === userId) + 1}위</> : <></>}
      />
      <br />
      <Flex align="center" justify="space-between" gap={4} css={{ width: '100%' }}>
        <H3>내가 가진 정보</H3>
        <DrawStockInfo stockId={stockId} />
      </Flex>
      <MyInfosContent myInfos={myInfos} fluctuationsInterval={stock.fluctuationsInterval} />
      <br />
      <H3>추천 대화상대</H3>
      <ul>
        {partnerNicknames?.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
      <br />
      <br />
      <br />
    </>
  );
};

const H3 = styled.h3`
  text-shadow: 2px 2px #8461f8;
`;

export default Home;
