import React from 'react';
import { SwitchCase } from '@toss/react';
import { useParams } from 'react-router-dom';
import { Query } from '../../hook';
import StockScreen from './component/StockScreen';

// playerLength / 3
// 29 - 10
// 30 - 10
export default function BackofficeScreen() {
  const { partyId } = useParams();
  const { data: party } = Query.Party.useQueryParty(partyId);

  if (!party) {
    return <></>;
  }

  return (
    <SwitchCase
      value={party.activityId}
      caseBy={{
        STOCK: <StockScreen party={party} />,
      }}
    />
  );
}
