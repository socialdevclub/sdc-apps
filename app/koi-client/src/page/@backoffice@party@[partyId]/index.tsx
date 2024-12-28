import React from 'react';
import { useParams } from 'react-router-dom';
import BackofficePartyDetail from 'src/component/BackofficePartyDetail';
import { Query } from '../../hook';

const BackofficePartyDetailPage = () => {
  const { partyId } = useParams();
  const { data: party } = Query.Party.useQueryParty(partyId);

  if (!party) return <></>;
  return (
    <>
      <BackofficePartyDetail party={party} />
    </>
  );
};

export default BackofficePartyDetailPage;
