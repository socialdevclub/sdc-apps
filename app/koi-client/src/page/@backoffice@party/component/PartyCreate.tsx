import { Button, Form, Input } from 'antd';
import React from 'react';
import { getQueryKey } from 'lib-react-query';
import { useQueryClient } from '@tanstack/react-query';
import { Query } from '../../../hook';
import { serverApiUrl } from '../../../config/baseUrl';

const PartyCreate = () => {
  const queryClient = useQueryClient();
  const invalidatePartyList = () =>
    queryClient.invalidateQueries(
      getQueryKey({
        hostname: serverApiUrl,
        method: 'GET',
        pathname: '/party',
      }),
    );

  const { mutateAsync, isLoading } = Query.Party.useCreateParty();

  const [title, setTitle] = React.useState('');
  const [limitAllCount, setLimitAllCount] = React.useState('');
  const [limitMaleCount, setLimitMaleCount] = React.useState('');
  const [limitFemaleCount, setLimitFemaleCount] = React.useState('');

  return (
    <Form>
      <Form.Item required label="title">
        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Form.Item>
      <Form.Item required label="limitAllCount">
        <Input type="text" value={limitAllCount} onChange={(e) => setLimitAllCount(e.target.value)} />
      </Form.Item>
      <Form.Item label="limitMaleCount">
        <Input type="text" value={limitMaleCount} onChange={(e) => setLimitMaleCount(e.target.value)} />
      </Form.Item>
      <Form.Item label="limitFemaleCount">
        <Input type="text" value={limitFemaleCount} onChange={(e) => setLimitFemaleCount(e.target.value)} />
      </Form.Item>
      <Form.Item>
        <Button
          onClick={async () => {
            await mutateAsync({
              limitAllCount: +limitAllCount,
              limitFemaleCount: limitFemaleCount === '' ? undefined : +limitFemaleCount,
              limitMaleCount: limitMaleCount === '' ? undefined : +limitMaleCount,
              title,
            });
            invalidatePartyList();
          }}
          loading={isLoading}
        >
          생성
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PartyCreate;
