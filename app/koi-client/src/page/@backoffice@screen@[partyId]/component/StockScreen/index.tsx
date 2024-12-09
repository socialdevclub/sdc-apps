import styled from '@emotion/styled';
import React from 'react';
import { getDateDistance } from '@toss/date';
import { SwitchCase } from '@toss/react';
import { QRCode } from 'antd';
import { PartySchemaWithId } from 'shared~type-party';
import dayjs from 'dayjs';
import { Query } from '../../../../hook';
import prependZero from '../../../../service/prependZero';
import PlayingWrapper from './PlayingWrapper';
import Table from './Table';

interface Props {
  party: PartySchemaWithId;
}

// playerLength / 3
// 29 - 10
// 30 - 10
export default function StockScreen({ party }: Props) {
  const { data: stock } = Query.Stock.useQueryStock(party.activityName, {
    keepPreviousData: false,
    refetchInterval: 500,
  });

  const startedTime = dayjs(stock?.startedTime).toDate();
  const isTransaction = stock?.isTransaction ?? false;

  const { seconds, minutes } = getDateDistance(startedTime, new Date());
  const time = `${prependZero(minutes, 2)}:${prependZero(seconds, 2)}`;

  if (!stock?._id) {
    return <></>;
  }

  return (
    <>
      <SwitchCase
        value={stock.stockPhase}
        caseBy={{
          PLAYING: (
            <PlayingWrapper stockId={stock._id}>
              <TimeBox>{time}</TimeBox>
              <Wrapper>
                <Container>{isTransaction && <Table stockId={stock._id} />}</Container>
              </Wrapper>
            </PlayingWrapper>
          ),
        }}
        defaultComponent={
          <>
            <TimeBox>QR코드를 스캔하여 입장하세요</TimeBox>
            <Wrapper>
              <Container>
                <QRCode value={window.location.origin} bgColor="#ffffff" size={300} />
              </Container>
            </Wrapper>
          </>
        }
      />
    </>
  );
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 180px 120px;
  box-sizing: border-box;
`;

const TimeBox = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 100px;
  font-size: 48px;
  text-shadow: 2px 2px #8461f8;
  color: white;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  box-shadow: 5px 5px #000000;
  background-color: #000084;
`;
