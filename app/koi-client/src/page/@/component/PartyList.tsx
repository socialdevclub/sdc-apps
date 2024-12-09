import { Button, Card } from 'antd';
import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { UserStore } from '../../../store';
import { Query } from '../../../hook';

const PartyList = () => {
  const navigate = useNavigate();

  const supabaseSession = useAtomValue(UserStore.supabaseSession);

  const { data: partyList } = Query.Party.useQueryPartyList();
  const { mutateAsync: joinParty } = Query.Party.useJoinParty();

  if (!partyList || !supabaseSession) {
    return <></>;
  }

  return partyList.map((party) => {
    return (
      <Card key={party._id} title={party.title}>
        <Button
          type="primary"
          onClick={async () => {
            await joinParty({ partyId: party._id, userId: supabaseSession.user.id });
            navigate(`/party/${party._id}`);
          }}
          // disabled={party.publicScope !== 'PUBLIC'}
        >
          참가
        </Button>
      </Card>
    );
  });
};

export default PartyList;
