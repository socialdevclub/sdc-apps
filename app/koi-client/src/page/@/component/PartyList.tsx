import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users } from 'lucide-react';
import styled from '@emotion/styled';
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
      party.activityId !== 'CLOSE' && (
        <PartyCard key={party._id}>
          <PartyInformation>
            <PartyTitle>{party.title}</PartyTitle>
            <ParticipantCount>
              <Users style={{ height: '16px', width: '16px' }} />
              {party.joinedUserIds.length}/{party.limitAllCount}
            </ParticipantCount>
          </PartyInformation>
          <ParticipateButton
            data-id={party._id}
            onClick={async () => {
              await joinParty({ partyId: party._id, userId: supabaseSession.user.id });
              navigate(`/party/${party._id}`);
            }}
            // disabled={party.publicScope !== 'PUBLIC'}
          >
            참가하기
            <Gamepad2 />
          </ParticipateButton>
        </PartyCard>
      )
    );
  });
};

export default PartyList;

const PartyCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: #252836;
  padding: 20px 24px;
  border-radius: 4px;
`;
const PartyInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 12px;
  overflow: hidden;
`;
const PartyTitle = styled.h2`
  color: white;
  font-size: 20px;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
`;
const ParticipantCount = styled.div`
  display: flex;
  align-items: center;
  column-gap: 4px;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.6);
`;

const ParticipateButton = styled.button`
  flex-shrink: 0;
  font-family: DungGeunMo;
  display: flex;
  align-items: center;
  column-gap: 8px;
  padding: 8px;
  background-color: transparent;
  border-radius: 4px;
  border: 1px solid #b6c3fd;
  color: #b6c3fd;
  font-size: 14px;
  cursor: pointer;
`;
