import { Button, Form, Input } from 'antd';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from 'lib-react-query';
import { Query } from '../../../../hook';
import { serverApiUrl } from '../../../../config/baseUrl';

interface Props {
  pollId: string;
}

const VoteCreateForm = ({ pollId }: Props) => {
  const queryClient = useQueryClient();
  const invalidatePollList = () =>
    queryClient.invalidateQueries(
      getQueryKey({
        hostname: serverApiUrl,
        method: 'GET',
        pathname: '/poll',
      }),
    );

  const { mutateAsync: AddVotes } = Query.Poll.useAddVotes();

  const [newVoteTitle, setNewVoteTitle] = React.useState('');
  const [limitAllCount, setLimitAllCount] = React.useState('');
  const [limitMaleCount, setLimitMaleCount] = React.useState('');
  const [limitFemaleCount, setLimitFemaleCount] = React.useState('');

  return (
    <Form>
      <Form.Item label="제목">
        <Input type="text" value={newVoteTitle} onChange={(e) => setNewVoteTitle(e.target.value)} />
      </Form.Item>
      <Form.Item label="인원제한">
        <Input type="text" value={limitAllCount} onChange={(e) => setLimitAllCount(e.target.value)} />
      </Form.Item>
      <Form.Item label="남자인원제한">
        <Input type="text" value={limitMaleCount} onChange={(e) => setLimitMaleCount(e.target.value)} />
      </Form.Item>
      <Form.Item label="여자인원제한">
        <Input type="text" value={limitFemaleCount} onChange={(e) => setLimitFemaleCount(e.target.value)} />
      </Form.Item>
      <Form.Item>
        <Button
          onClick={async () => {
            await AddVotes({
              pollId,
              votes: [
                {
                  limitAllCount: limitAllCount === '' ? undefined : +limitAllCount,
                  limitFemaleCount: limitFemaleCount === '' ? undefined : +limitFemaleCount,
                  limitMaleCount: limitMaleCount === '' ? undefined : +limitMaleCount,
                  title: newVoteTitle,
                },
              ],
            });
            invalidatePollList();
          }}
        >
          새 투표 생성
        </Button>
      </Form.Item>
    </Form>
  );
};

export default VoteCreateForm;
