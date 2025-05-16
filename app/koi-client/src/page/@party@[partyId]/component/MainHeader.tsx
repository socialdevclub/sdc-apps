import { Space } from 'antd';
import { css } from '@linaria/core';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import Header from '../../../component-presentation/Header';
import ProfileValidator from '../../../component/ProfileValidator';
import { Query } from '../../../hook';
import RemainTimeClock from '../../../component-presentation/RemainTimeClock';
import useRoundTimeRaceCheck from '../../../hook/useRoundTimeRaceCheck.tsx';

const PartyHeader = () => {
  const { partyId } = useParams();
  const { data: party } = Query.Party.useQueryParty(partyId ?? '');
  const { data: stock, refetch } = Query.Stock.useQueryStock(party?.activityName ?? '');

  const { remainingTime, roundTime } = useRoundTimeRaceCheck({ refetch, stock });
  const navigate = useNavigate();

  return (
    <ProfileValidator>
      <Header
        title={party?.title}
        LeftComponent={
          <ChevronLeft
            size={32}
            onClick={() => {
              navigate(-1);
            }}
            className={css`
              color: white;
              flex-shrink: 0;

              &:hover {
                cursor: pointer;
              }
            `}
          />
        }
        RightComponent={
          <Space>
            {stock?.isTransaction && (
              <RemainTimeClock
                totalTime={roundTime} // 분 단위로 주어지기에, 60을 곱해서 초로 계산
                remainingTime={remainingTime} // 초 단위로 주어지기에, 60을 나누어서 분으로 계산
              />
            )}
          </Space>
        }
      />
      {/* {contextHolder} */}
    </ProfileValidator>
  );
};

export default PartyHeader;
