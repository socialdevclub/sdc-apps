import { StockConfig } from 'shared~config';
import React, { CSSProperties } from 'react';
import styled from '@emotion/styled';
import { commaizeNumber } from '@toss/utils';
import { css } from '@emotion/react';
import { Query } from '../../../../hook';

interface Props {
  stockId: string;
}

const Table = ({ stockId }: Props) => {
  const { data: stock, timeIdx } = Query.Stock.useQueryStock(stockId, { keepPreviousData: false });

  if (!stock?.companies || timeIdx === undefined) {
    return <></>;
  }

  const { companies } = stock;
  const companyNames = Object.keys(companies) as StockConfig.CompanyNames[];

  return (
    <Wrapper>
      <Row>
        <RowHeaderItem>주식이름</RowHeaderItem>
        <RowHeaderItem>현재 가격</RowHeaderItem>
        <RowHeaderItem>변동 정보</RowHeaderItem>
        <RowHeaderItem>남은 수량</RowHeaderItem>
      </Row>
      <Row>
        <RowHeaderItem>주식이름</RowHeaderItem>
        <RowHeaderItem>현재 가격</RowHeaderItem>
        <RowHeaderItem>변동 정보</RowHeaderItem>
        <RowHeaderItem>남은 수량</RowHeaderItem>
      </Row>
      {companyNames.map((company) => {
        if (timeIdx > 9) {
          return <></>;
        }

        const remainingStock = stock.remainingStocks[company];
        const diff = timeIdx === 0 ? 0 : companies[company][timeIdx].가격 - companies[company][timeIdx - 1].가격;
        const 등락 =
          diff > 0 ? `▲${commaizeNumber(Math.abs(diff))}` : diff < 0 ? `▼${commaizeNumber(Math.abs(diff))}` : '-';
        const color = diff > 0 ? '#F87171' : diff < 0 ? '#60A5FA' : undefined;

        return (
          <Row key={company}>
            <RowItem>{company}</RowItem>
            <RowItem>{commaizeNumber(companies[company][timeIdx].가격)}</RowItem>
            <RowItem color={color}>{등락}</RowItem>
            <RowItem
              style={{
                width: '10px',
              }}
            >
              {remainingStock}
            </RowItem>
          </Row>
        );
      })}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
  width: 50%;
  font-size: 28px;
  color: white;
`;

const RowItem = styled.div<{ color?: CSSProperties['color'] }>`
  flex: 1;
  ${({ color }) => css`
    color: ${color};
  `};
  display: flex;
  justify-content: center;
`;

const RowHeaderItem = styled.div`
  flex: 1;
  color: rgb(202, 202, 202);
  display: flex;
  font-size: 20px;
  justify-content: center;
  text-decoration: underline;
  text-underline-offset: 6px;
  text-decoration-thickness: 1px;
`;

export default Table;
