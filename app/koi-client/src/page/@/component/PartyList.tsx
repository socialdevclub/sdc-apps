import { useAtomValue } from 'jotai';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Gamepad2, Users } from 'lucide-react';
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

  return (
    <>
      <H2>🎮 게임 리스트</H2>
      {partyList?.map((party) => {
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
      })}
    </>
  );
};

export default PartyList;

const H2 = styled.h2`
  position: relative;
  font-size: 18px;
  font-weight: 400;
  color: white;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #374151;
    margin-left: 12px;
  }
`;

const PartyCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: #1a1e2d;
  padding: 20px 16px 20px 24px;
  border-radius: 12px;
`;
const PartyInformation = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  row-gap: 12px;
  overflow: hidden;
  flex: 1;
  min-width: 0;
`;
const PartyTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 400;
  word-break: break-word;
  overflow-wrap: break-word;
`;
const ParticipantCount = styled.div`
  display: flex;
  align-items: center;
  column-gap: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const ParticipateButton = styled.button`
  display: flex;
  align-items: center;
  column-gap: 8px;

  flex-shrink: 0;
  border: none;
  border-radius: 4px;
  font-family: DungGeunMo;

  padding: 4px 12px;
  margin-left: 12px;
  background-color: #2d3244;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
`;
