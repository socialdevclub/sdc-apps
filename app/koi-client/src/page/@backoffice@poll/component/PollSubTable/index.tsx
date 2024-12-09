import { Row } from '@tanstack/react-table';
import React from 'react';
import { PollSchemaWithId } from 'shared~type-poll';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from 'lib-react-query';
import { Button, Form, Radio } from 'antd';
import { Query } from '../../../../hook';
import { serverApiUrl } from '../../../../config/baseUrl';
import VoteCreateForm from './VoteCreateForm';

const PollSubTable = ({ row, className }: { row: Row<PollSchemaWithId>; className?: string }) => {
  const queryClient = useQueryClient();
  const invalidatePollList = () =>
    queryClient.invalidateQueries(
      getQueryKey({
        hostname: serverApiUrl,
        method: 'GET',
        pathname: '/poll',
      }),
    );

  const { mutateAsync: deletePollList } = Query.Poll.useDeletePollList();
  const { mutateAsync: updatePoll } = Query.Poll.useUpdatePoll();

  const [pollTitle, setPollTitle] = React.useState(row.original.title);
  const [status, setStatus] = React.useState(row.original.status);

  return (
    <>
      <h2>총 참가자</h2>
      <ul>
        {row.original.users.map((user) => (
          <li key={user.userId}>
            {user.nickname} ({user.userId})
          </li>
        ))}
      </ul>
      <h2>투표 현황</h2>
      <ul>
        {row.original.votes.map((vote) => (
          <li key={vote.title}>
            {vote.title}: {vote.userIds.length}명 (
            {vote.userIds
              .map((userId) => {
                const user = row.original.users.find((user) => user.userId === userId);
                if (!user) return '?';
                return user.nickname;
              })
              .join(', ')}
            )
            <ul>
              {vote.limitAllCount !== undefined && <li>모든제한: {vote.limitAllCount}명</li>}
              {vote.limitMaleCount !== undefined && <li>남자제한: {vote.limitMaleCount}명</li>}
              {vote.limitFemaleCount !== undefined && <li>여자제한: {vote.limitFemaleCount}명</li>}
            </ul>
          </li>
        ))}
      </ul>
      <h2>새 투표 생성</h2>
      <VoteCreateForm pollId={row.original._id} />
      <h2>투표 관리</h2>
      <Form>
        <Form.Item label="투표 제목">
          <input type="text" value={pollTitle} onChange={(e) => setPollTitle(e.target.value)} />
        </Form.Item>
        <Form.Item label="투표 상태">
          <Radio.Group
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
          >
            <Radio value="DRAFT">DRAFT</Radio>
            <Radio value="OPEN">OPEN</Radio>
            <Radio value="CLOSE">CLOSE</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Button
            onClick={async () => {
              await updatePoll({
                _id: row.original._id,
                status,
                title: pollTitle,
              });
              invalidatePollList();
            }}
          >
            적용
          </Button>
          <Button
            onClick={async () => {
              await deletePollList({
                pollIds: [row.original._id],
              });
              invalidatePollList();
            }}
          >
            삭제
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default PollSubTable;
