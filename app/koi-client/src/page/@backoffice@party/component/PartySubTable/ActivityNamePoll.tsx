import React from 'react';
import { Radio } from 'antd';
import { Query } from '../../../../hook';

interface Props {
  activityName?: string;
  setActivityName: (activityName: string) => void;
}

const ActivityNamePoll = ({ activityName, setActivityName }: Props) => {
  const { data: pollList } = Query.Poll.useQueryPollList();

  if (!pollList) {
    return <></>;
  }

  return (
    <Radio.Group
      value={activityName}
      onChange={(e) => {
        setActivityName(e.target.value);
      }}
    >
      {pollList.map((poll) => {
        return (
          <Radio key={poll._id} value={poll._id}>
            {poll.title} ({poll._id})
          </Radio>
        );
      })}
    </Radio.Group>
  );
};

export default ActivityNamePoll;
