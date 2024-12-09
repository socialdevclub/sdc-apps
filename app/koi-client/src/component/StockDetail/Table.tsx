import { stock } from 'shared~config';
import React from 'react';
import styled from '@emotion/styled';
import { commaizeNumber } from '@toss/utils';
import { Query } from '../../hook';
import { POV } from '../../type';
import prependZero from '../../service/prependZero';

interface Props {
  elapsedTime: Date;
  pov: POV;
  stockId: string;
}

const Table = ({ elapsedTime, pov, stockId }: Props) => {
  const { data: game } = Query.Stock.useQueryStock(stockId);
  const { data: users } = Query.Stock.useUserList(stockId);
  const { data: profiles } = Query.Supabase.useQueryProfileById(users.map((v) => v.userId));
  const { data: results } = Query.Stock.useQueryResult(stockId);

  if (!game?.companies) {
    return <></>;
  }

  const sortedUsers = [...users].sort((a, b) => b.money - a.money) || [];
  const { companies, remainingStocks } = game;
  const companyNames = Object.keys(companies) as stock.CompanyNames[];

  return (
    <Wrapper>
      <TableElement>
        <thead>
          <tr>
            <Td rowSpan={2}>게임시각</Td>
            {companyNames.map((company) => (
              <Td colSpan={3} key={company}>
                {company}
              </Td>
            ))}
          </tr>
          <tr>
            {companyNames.map((company) => (
              <React.Fragment key={company}>
                <Td>등락</Td>
                <Td>가격</Td>
                <Td>정보</Td>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, idx) => {
            return (
              <tr key={idx}>
                <Td>{`${prependZero(idx * game.fluctuationsInterval, 2)}분`}</Td>
                {companyNames.map((key) => {
                  const company = key as stock.CompanyNames;
                  const diff = idx === 0 ? 0 : companies[company][idx].가격 - companies[company][idx - 1].가격;
                  const 등락 = diff > 0 ? `${Math.abs(diff)}▲` : diff < 0 ? `${Math.abs(diff)}▼` : '-';
                  const 정보 = companies[company][idx].정보.join('/');

                  if (elapsedTime.getMinutes() >= idx * game.fluctuationsInterval || pov === 'host') {
                    return (
                      <React.Fragment key={company}>
                        <Td>{commaizeNumber(등락)}</Td>
                        <Td key={company}>{commaizeNumber(companies[company as stock.CompanyNames][idx]?.가격)}</Td>
                        <Td>{pov === 'host' ? 정보 : '.'}</Td>
                      </React.Fragment>
                    );
                  }

                  return (
                    <React.Fragment key={company}>
                      <Td>?</Td>
                      <Td key={company}>?</Td>
                      <Td>.</Td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </TableElement>

      <TableElement>
        <thead>
          <tr>
            <Td>잔여주식</Td>
            {companyNames.map((company) => (
              <Td key={company}>{company}</Td>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>시장</Td>
            {companyNames.map((company) => (
              <Td key={company}>{remainingStocks[company]}</Td>
            ))}
          </tr>
          {users.map((user) => {
            return (
              <tr key={user.userId}>
                <Td>{profiles?.data?.find((v) => v.id === user.userId)?.username}</Td>
                {companyNames.map((company) => {
                  return <Td key={company}>{user.inventory[company] || ''}</Td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </TableElement>

      <TableElement>
        <thead>
          <tr>
            <Td>소지금</Td>
            {sortedUsers.map((user, i) => {
              return (
                <Td key={user.userId}>
                  {i + 1}위, {profiles?.data?.find((v) => v.id === user.userId)?.username}
                </Td>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td />
            {sortedUsers.map((user) => {
              return <Td key={user.userId}>{commaizeNumber(user.money)}</Td>;
            })}
          </tr>
          <tr>
            <Td />
            {sortedUsers.map((user) => {
              return <Td key={user.userId}>{commaizeNumber(user.money - 1000000)}</Td>;
            })}
          </tr>
        </tbody>
      </TableElement>

      <TableElement>
        <thead>
          <tr>
            <Td>닉네임</Td>
            {sortedUsers.map((user) => {
              return <Td key={user.userId}>{profiles?.data?.find((v) => v.id === user.userId)?.username}</Td>;
            })}
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>0라운드</Td>
            {sortedUsers.map((user) => {
              return (
                <Td key={user.userId}>
                  {commaizeNumber(results?.filter((v) => v.userId === user.userId && v.round === 0)[0]?.money ?? '')}
                </Td>
              );
            })}
          </tr>
          <tr>
            <Td>1라운드</Td>
            {sortedUsers.map((user) => {
              return (
                <Td key={user.userId}>
                  {commaizeNumber(results?.filter((v) => v.userId === user.userId && v.round === 1)[0]?.money ?? '')}
                </Td>
              );
            })}
          </tr>
          <tr>
            <Td>2라운드</Td>
            {sortedUsers.map((user) => {
              return (
                <Td key={user.userId}>
                  {commaizeNumber(results?.filter((v) => v.userId === user.userId && v.round === 2)[0]?.money ?? '')}
                </Td>
              );
            })}
          </tr>
          <tr>
            <Td>1+2라운드 합계</Td>
            {sortedUsers.map((user) => {
              return (
                <Td key={user.userId}>
                  {commaizeNumber(
                    results
                      ?.filter((v) => v.userId === user.userId && v.round > 0)
                      .reduce((acc, v) => acc + v.money, 0),
                  )}
                </Td>
              );
            })}
          </tr>
          <tr>
            <Td>1+2라운드 평균</Td>
            {sortedUsers.map((user) => {
              return (
                <Td key={user.userId}>
                  {commaizeNumber(
                    (results
                      ?.filter((v) => v.userId === user.userId && v.round > 0)
                      .reduce((acc, v) => acc + v.money, 0) ?? 0) / 2,
                  )}
                </Td>
              );
            })}
          </tr>
        </tbody>
      </TableElement>

      {/* <TableElement>
        <thead>
          <tr>
            <Td rowSpan={2}>회사</Td>
            {users.map((user) => (
              <Td colSpan={3} key={user.nickname}>
                {user.nickname}
              </Td>
            ))}
          </tr>
          <tr>
            {users.map((user) => (
              <React.Fragment key={user.nickname}>
                <Td>소지금액</Td>
                <Td>팔고난후금액</Td>
                <Td>팔고난후수익률</Td>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {companyNames.map((company) => {
            return (
              <tr key={company}>
                <Td>{company}</Td>
                {users.map((user) => {
                  return (
                    <React.Fragment key={user.nickname}>
                      <Td>{commaizeNumber(user.money)}</Td>
                      <Td />
                      <Td />
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </TableElement> */}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin: 20px;
  width: 1200px;
  overflow-x: scroll;
  gap: 20px;

  display: flex;
  flex-direction: column;
`;

const TableElement = styled.table`
  width: 100%;
`;

const Td = styled.td`
  border: 1px solid black;
  padding: 10px;

  /* 1줄 텍스트 */
  white-space: nowrap;
`;

export default Table;
