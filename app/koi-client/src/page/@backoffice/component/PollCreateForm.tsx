import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from 'lib-react-query';
import { Query } from '../../../hook';
import { serverApiUrl } from '../../../config/baseUrl';

const PollCreateForm = () => {
  const [title, setTitle] = React.useState('');
  console.debug('🚀 ~ file: PollCreateForm.tsx:6 ~ PollCreateForm ~ title:', title);
  const { mutateAsync } = Query.Poll.useCreatePoll();

  const queryClient = useQueryClient();

  return (
    <>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      <button
        onClick={async () => {
          await mutateAsync({ title });
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
      </button>
    </>
  );
};

export default PollCreateForm;
