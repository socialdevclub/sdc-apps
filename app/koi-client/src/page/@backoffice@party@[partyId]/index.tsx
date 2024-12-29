import React from 'react';
import { useParams } from 'react-router-dom';
import { Query } from '../../hook';
import BackofficePartyDetail from '../../component/BackofficePartyDetail';

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
