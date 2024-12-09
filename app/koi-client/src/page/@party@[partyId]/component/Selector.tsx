import React from 'react';
import { useParams } from 'react-router-dom';
import { SwitchCase } from '@toss/react';
import { Query } from '../../../hook';
import Poll from './Poll';
import Feed from './Feed';
import Stock from './Stock';

const Selector = () => {
  const { partyId } = useParams();
  const { data: party } = Query.Party.useQueryParty(partyId ?? '');

  if (!party) {
    return <></>;
  }

  return (
    <SwitchCase
      value={party.activityId}
      caseBy={{
        FEED: <Feed party={party} />,
        POLL: <Poll />,
        STOCK: <Stock party={party} />,
      }}
      defaultComponent={<center>환영합니다! 호스트의 지시를 따라주세요!</center>}
    />
  );
};

export default Selector;
