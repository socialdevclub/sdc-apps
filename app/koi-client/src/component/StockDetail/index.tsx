import styled from '@emotion/styled';
import React, { useState } from 'react';
import { useInterval } from '@toss/react';
import { RadioGroup } from '@headlessui/react';
import { css } from '@emotion/react';
import { objectKeys } from '@toss/utils';
import { getDateDistance } from '@toss/date';
import { getRandomCompanyNames } from 'shared~config/dist/stock';
import dayjs from 'dayjs';
import { Query } from '../../hook';
import { POV } from '../../type';
import UserList from './UserList';
import Table from './Table';
import RoundSetter from './RoundSetter';
import prependZero from '../../service/prependZero';

interface Props {
  stockId: string;
}

// playerLength / 3
// 29 - 10
// 30 - 10
export default function StockDetail({ stockId }: Props) {
  const { mutateAsync: mutateUpdateGame } = Query.Stock.useUpdateStock();
  const { mutateAsync: mutateInitStock } = Query.Stock.useInitStock(stockId);
  const { mutateAsync: mutateResetGame } = Query.Stock.useResetStock(stockId);
  const { mutateAsync: mutateBuyStock } = Query.Stock.useBuyStock();
  const { mutateAsync: mutateSellStock } = Query.Stock.useSellStock();
  const { mutateAsync: mutateFinishStock } = Query.Stock.useFinishStock(stockId);
  const { mutateAsync: mutateSetResult } = Query.Stock.useSetResult(stockId);

  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: stock } = Query.Stock.useQueryStock(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));

  const companies = stock?.companies ?? {};
  const companyNames = objectKeys(companies).length > 0 ? objectKeys(companies) : getRandomCompanyNames();
  const startedTime = dayjs(stock?.startedTime).toDate();
  const currentPriceIdx = Math.floor(
    getDateDistance(startedTime, new Date()).minutes / (stock?.fluctuationsInterval ?? 5),
  );

  const [selectedCompany, setSelectedCompany] = useState<string>(companyNames[0]);
  const [selectedUser, setSelectedUser] = useState<string>(users?.[0]?.userId ?? '');
  const [pov, setPov] = useState<POV>('player');

  // 경과된 시간
  const [elapsedTime, setElapsedTime] = useState<Date>(new Date(new Date().getTime() - startedTime.getTime()));

  useInterval(
    () => {
      setElapsedTime(new Date(new Date().getTime() - startedTime.getTime()));
    },
    {
      delay: 1000,
    },
  );

  return (
    <Container>
      <UserList stockId={stockId} />
      <Table stockId={stockId} elapsedTime={elapsedTime} pov={pov} />
      <hr />
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            stockPhase: 'CROWDING',
          });
        }}
      >
        CRAWDING
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            stockPhase: 'WAITING',
          });
        }}
      >
        WAITING
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            stockPhase: 'PLAYING',
          });
        }}
      >
        PLAYING
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            stockPhase: 'RESULT',
          });
        }}
      >
        RESULT
      </button>
      <button
        onClick={() => {
          mutateResetGame({});
        }}
      >
        게임 초기화
      </button>
      <button
        onClick={() => {
          mutateInitStock({});
        }}
      >
        주식 초기화
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            isTransaction: true,
            startedTime: new Date(),
          });
        }}
      >
        주식 거래 활성화
      </button>
      <button
        onClick={() => {
          mutateFinishStock({});
        }}
      >
        주식 종료 및 정산
      </button>
      <button
        onClick={() => {
          mutateSetResult({});
        }}
      >
        라운드 저장
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            isTransaction: !stock?.isTransaction,
          });
        }}
      >
        주식 토글 (현재상태:{stock?.isTransaction ? 'true' : 'false'})
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            isVisibleRank: !stock?.isVisibleRank,
          });
        }}
      >
        순위 공개 토글 (현재상태:{stock?.isVisibleRank ? 'true' : 'false'})
      </button>
      <RoundSetter stockId={stockId} />
      <input
        placeholder={`시세변동주기 (${stock?.fluctuationsInterval}분)`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !!+event.currentTarget.value) {
            mutateUpdateGame({
              _id: stockId,
              fluctuationsInterval: +event.currentTarget.value,
            });
          }
        }}
      />
      <input
        placeholder={`활동제한주기 (${stock?.transactionInterval}초)`}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !!+event.currentTarget.value) {
            mutateUpdateGame({
              _id: stockId,
              transactionInterval: +event.currentTarget.value,
            });
          }
        }}
      />
      <button
        onClick={() => {
          setPov(pov === 'host' ? 'player' : 'host');
        }}
      >
        {pov === 'host' ? '참가자' : '호스트'} 시점
      </button>
      <div>
        시작된 시간 :{' '}
        {startedTime.toLocaleString('ko-KR', {
          hour12: false,
          timeZone: 'Asia/Seoul',
        })}
      </div>
      <div>
        경과된 시간 : {`${prependZero(elapsedTime.getMinutes(), 2)}:${prependZero(elapsedTime.getSeconds(), 2)}`}
      </div>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            startedTime: new Date(startedTime.getTime() - 60 * 1000),
          });
        }}
      >
        1분 과거로
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            startedTime: new Date(startedTime.getTime() + 60 * 1000),
          });
        }}
      >
        1분 미래로
      </button>
      <button
        onClick={() => {
          mutateUpdateGame({
            _id: stockId,
            startedTime: new Date(startedTime.getTime() - 10 * 1000),
          });
        }}
      >
        10초 과거로
      </button>
      <hr />
      <RadioGroup
        value={selectedUser}
        onChange={(value) => {
          setSelectedUser(value);
        }}
      >
        <RadioGroup.Label>유저 선택</RadioGroup.Label>
        <div
          css={css`
            display: flex;
            gap: 8px;
          `}
        >
          {users.map((user) => (
            <RadioGroup.Option key={user.userId} value={user.userId}>
              {({ checked }) => (
                <span style={{ color: checked ? 'red' : 'black' }}>
                  {profiles?.data?.find((v) => v.id === user.userId)?.username}
                </span>
              )}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      <RadioGroup
        value={selectedCompany}
        onChange={(value) => {
          setSelectedCompany(value);
        }}
      >
        <RadioGroup.Label>회사 선택</RadioGroup.Label>
        <div
          css={css`
            display: flex;
            gap: 8px;
          `}
        >
          {companyNames.map((company) => (
            <RadioGroup.Option key={company} value={company}>
              {({ checked }) => <span style={{ color: checked ? 'red' : 'black' }}>{company}</span>}
            </RadioGroup.Option>
          ))}
        </div>
      </RadioGroup>
      <button
        onClick={() => {
          mutateBuyStock({
            amount: 1,
            company: selectedCompany,
            stockId,
            unitPrice: stock?.companies[selectedCompany][currentPriceIdx].가격 ?? -1,
            userId: selectedUser,
          });
        }}
      >
        매수
      </button>
      <button
        onClick={() => {
          mutateSellStock({
            amount: 1,
            company: selectedCompany,
            stockId,
            unitPrice: stock?.companies[selectedCompany][currentPriceIdx].가격 ?? -1,
            userId: selectedUser,
          });
        }}
      >
        매도
      </button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  box-sizing: border-box;
  // padding: 20px;
`;
