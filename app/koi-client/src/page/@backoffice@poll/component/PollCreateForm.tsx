import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from 'lib-react-query';
import { Button, Form, Input } from 'antd';
import { Query } from '../../../hook';
import { serverApiUrl } from '../../../config/baseUrl';

const PollCreateForm = () => {
  const [title, setTitle] = React.useState('');
  const [limitAllCount, setLimitAllCount] = React.useState('');
  const [limitMaleCount, setLimitMaleCount] = React.useState('');
  const [limitFemaleCount, setLimitFemaleCount] = React.useState('');

  console.debug('🚀 ~ file: PollCreateForm.tsx:6 ~ PollCreateForm ~ title:', title);
  const { mutateAsync } = Query.Poll.useCreatePoll();

  const queryClient = useQueryClient();

  return (
    <Form>
      <Form.Item label="제목">
        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
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
            await mutateAsync({
              limitAllCount: limitAllCount === '' ? undefined : +limitAllCount,
              limitFemaleCount: limitFemaleCount === '' ? undefined : +limitFemaleCount,
              limitMaleCount: limitMaleCount === '' ? undefined : +limitMaleCount,
              title,
            });
            queryClient.invalidateQueries(
              getQueryKey({
                hostname: serverApiUrl,
                method: 'GET',
                pathname: '/poll',
              }),
            );
          }}
        >
          생성
        </Button>
      </Form.Item>
    </Form>
  );
};

export default PollCreateForm;
