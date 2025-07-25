import { useNavigate, useParams } from 'react-router-dom';
import { SwitchCase } from '@toss/react';
import { Query } from '../../../hook';
import Poll from './Poll';
import Feed from './Feed';
import Stock from './Stock';
import { LOCAL_STORAGE_KEY } from '../../../config/localStorage';

const DefaultComponent = () => {
  return <center>환영합니다! 호스트의 지시를 따라주세요!</center>;
};

const Selector = () => {
  const { partyId } = useParams();
  const navigate = useNavigate();
  let party;

  try {
    const { data: partyData } = Query.Party.useQueryParty(partyId ?? '');
    party = partyData;
  } catch (error) {
    // 파티가 유효하지 않은 경우 로컬스토리지 제거, 홈으로 이동
    console.error('Error fetching party data:', error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    navigate('/');
  }

  if (!party?.activityName) {
    return <DefaultComponent />;
  }

  return (
    <SwitchCase
      value={party.activityId}
      caseBy={{
        FEED: <Feed party={party} />,
        POLL: <Poll />,
        STOCK: <Stock partyId={party._id} stockId={party.activityName} />,
      }}
      defaultComponent={<DefaultComponent />}
    />
  );
};

export default Selector;
