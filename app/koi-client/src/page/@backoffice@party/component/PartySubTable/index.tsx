import { Row } from '@tanstack/react-table';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from 'lib-react-query';
import { Button, Form, Input, Radio } from 'antd';
import { PartySchemaWithId } from 'shared~type-party';
import { SwitchCase } from '@toss/react';
import { Query } from '../../../../hook';
import { serverApiUrl } from '../../../../config/baseUrl';
import ActivityNamePoll from './ActivityNamePoll';

const PartySubTable = ({ row, className }: { row: Row<PartySchemaWithId>; className?: string }) => {
  const queryClient = useQueryClient();
  const invalidatePartyList = () =>
    queryClient.invalidateQueries(
      getQueryKey({
        hostname: serverApiUrl,
        method: 'GET',
        pathname: '/party',
      }),
    );

  const { mutateAsync: updateParty, isLoading: isLoadingUpdateParty } = Query.Party.useUpdateParty();
  const { mutateAsync: deleteParty, isLoading: isLoadingDeleteParty } = Query.Party.useDeleteParty(row.original._id);

  const [title, setTitle] = React.useState(row.original.title);
  const [activityId, setActivityId] = React.useState(row.original.activityId);
  const [activityName, setActivityName] = React.useState(row.original.activityName);

  const isLoading = isLoadingUpdateParty || isLoadingDeleteParty;

  return (
    <>
      <h2>총 참가자</h2>
      <ul>
        {row.original.joinedUserIds.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
      <h2>파티 관리</h2>
      <Form>
        <Form.Item label="title">
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Form.Item>
        <Form.Item label="ActivityId">
          <Radio.Group
            value={activityId}
            onChange={(e) => {
              setActivityId(e.target.value);
            }}
          >
            <Radio value="INITIAL">INITIAL</Radio>
            <Radio value="POLL">POLL</Radio>
            <Radio value="STOCK">STOCK</Radio>
            <Radio value="FEED">FEED</Radio>
            <Radio value="CLOSE">CLOSE</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="ActivityName">
          <SwitchCase
            value={activityId}
            caseBy={{
              POLL: <ActivityNamePoll activityName={activityName} setActivityName={setActivityName} />,
            }}
            defaultComponent={
              <Input type="text" value={activityName} onChange={(e) => setActivityName(e.target.value)} />
            }
          />
        </Form.Item>
        <Form.Item>
          <Button
            onClick={async () => {
              await updateParty({
                _id: row.original._id,
                activityId,
                activityName,
                title,
              });
              invalidatePartyList();
            }}
            loading={isLoading}
          >
            적용
          </Button>
          <Button
            onClick={async () => {
              await deleteParty({});
              invalidatePartyList();
            }}
            loading={isLoading}
          >
            삭제
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default PartySubTable;
