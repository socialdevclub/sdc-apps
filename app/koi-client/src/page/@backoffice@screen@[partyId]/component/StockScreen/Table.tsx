import { stock } from 'shared~config';
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

  if (!stock?.companies || !timeIdx) {
    return <></>;
  }

  const { companies } = stock;
  const companyNames = Object.keys(companies) as stock.CompanyNames[];

  return (
    <Wrapper>
      {companyNames.map((company) => {
        if (timeIdx > 9) {
          return <></>;
        }

        const remainingStock = stock.remainingStocks[company];
        const diff = timeIdx === 0 ? 0 : companies[company][timeIdx].가격 - companies[company][timeIdx - 1].가격;
        const 등락 =
          diff > 0 ? `▲${commaizeNumber(Math.abs(diff))}` : diff < 0 ? `▼${commaizeNumber(Math.abs(diff))}` : '';
        const color = diff > 0 ? '#00ff00' : diff < 0 ? '#ff0000' : undefined;

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
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  flex-wrap: wrap;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  width: 50%;
  font-size: 28px;
  color: white;
  justify-content: space-evenly;
`;

const RowItem = styled.div<{ color?: CSSProperties['color'] }>`
  width: 140px;
  ${({ color }) => css`
    color: ${color};
  `};
`;

export default Table;
